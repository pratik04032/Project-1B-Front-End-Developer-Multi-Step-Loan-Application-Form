import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  updateDoc, 
  query, 
  where,
  deleteDoc
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID if available
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function checkAndHandleError(error: any, op: OperationType, path: string) {
  if (error && (error.code === "permission-denied" || String(error.message || "").toLowerCase().includes("permission"))) {
    handleFirestoreError(error, op, path);
  }
}

// Save Application to Firestore
export async function saveApplication(id: string, formState: any) {
  try {
    // Sanitize to avoid 1MB document limit for base64 uploads
    const sanitizedUploadedFiles: Record<string, any[]> = {};
    if (formState.uploadedFiles) {
      Object.entries(formState.uploadedFiles).forEach(([key, files]) => {
        if (Array.isArray(files)) {
          sanitizedUploadedFiles[key] = files.map((f: any) => ({
            id: f.id,
            name: f.name,
            type: f.type,
            size: f.size,
            originalSize: f.originalSize,
            compressedSize: f.compressedSize || null
          }));
        } else {
          sanitizedUploadedFiles[key] = [];
        }
      });
    }

    const appData = {
      ...formState,
      uploadedFiles: sanitizedUploadedFiles,
      id,
      status: "PRE-APPROVED",
      createdAt: new Date().toISOString(),
      isDefaulter: false // default false
    };

    await setDoc(doc(db, "applications", id), appData);
    return { success: true };
  } catch (error) {
    console.error("Error saving application to database:", error);
    checkAndHandleError(error, OperationType.WRITE, `applications/${id}`);
    return { success: false, error };
  }
}

// Check if PAN or Aadhaar is in Defaulters Registry
export async function checkIfDefaulter(pan: string, aadhaar: string) {
  const cleanPan = pan?.toUpperCase().trim();
  const cleanAadhaar = aadhaar?.replace(/\s+/g, "").trim();

  if (!cleanPan && !cleanAadhaar) return { isDefaulter: false };

  try {
    // 1. Check in 'defaulters' collection by PAN
    if (cleanPan) {
      const panDoc = await getDoc(doc(db, "defaulters", cleanPan));
      if (panDoc.exists() && panDoc.data().isDefaulter !== false) {
        return { isDefaulter: true, reason: panDoc.data().reason || "Defaulted on previous loan payments" };
      }
    }

    // 2. Check in 'defaulters' collection by Aadhaar
    if (cleanAadhaar) {
      const aadhaarDoc = await getDoc(doc(db, "defaulters", cleanAadhaar));
      if (aadhaarDoc.exists() && aadhaarDoc.data().isDefaulter !== false) {
        return { isDefaulter: true, reason: aadhaarDoc.data().reason || "Defaulted on previous loan payments" };
      }
    }

    // 3. Query 'applications' collection where isDefaulter is true
    if (cleanPan) {
      const qPan = query(collection(db, "applications"), where("panNumber", "==", cleanPan), where("isDefaulter", "==", true));
      const qPanSnap = await getDocs(qPan);
      if (!qPanSnap.empty) {
        return { isDefaulter: true, reason: "Flagged as defaulter on a previous application" };
      }
    }

    if (cleanAadhaar) {
      const qAadhaar = query(collection(db, "applications"), where("aadhaarNumber", "==", cleanAadhaar), where("isDefaulter", "==", true));
      const qAadhaarSnap = await getDocs(qAadhaar);
      if (!qAadhaarSnap.empty) {
        return { isDefaulter: true, reason: "Flagged as defaulter on a previous application" };
      }
    }

    return { isDefaulter: false };
  } catch (error) {
    console.error("Error checking defaulter status:", error);
    checkAndHandleError(error, OperationType.GET, "defaulters / applications");
    return { isDefaulter: false };
  }
}

// Mark/unmark as Defaulter
export async function setDefaulterStatus(
  applicationId: string, 
  pan: string, 
  aadhaar: string, 
  fullName: string, 
  isDefaulter: boolean,
  reason: string = "Defaulted on previous loan payments"
) {
  try {
    // 1. Update application doc
    const appRef = doc(db, "applications", applicationId);
    await updateDoc(appRef, { isDefaulter });

    const cleanPan = pan?.toUpperCase().trim();
    const cleanAadhaar = aadhaar?.replace(/\s+/g, "").trim();

    // 2. Add or remove from 'defaulters' registry
    if (isDefaulter) {
      const payload = {
        applicationId,
        fullName,
        panNumber: cleanPan || "",
        aadhaarNumber: cleanAadhaar || "",
        isDefaulter: true,
        reason,
        markedAt: new Date().toISOString()
      };

      if (cleanPan) {
        await setDoc(doc(db, "defaulters", cleanPan), payload);
      }
      if (cleanAadhaar) {
        await setDoc(doc(db, "defaulters", cleanAadhaar), payload);
      }
    } else {
      // Unflag - we don't delete to keep historical records, just update status
      if (cleanPan) {
        await setDoc(doc(db, "defaulters", cleanPan), { isDefaulter: false, unmarkedAt: new Date().toISOString() }, { merge: true });
      }
      if (cleanAadhaar) {
        await setDoc(doc(db, "defaulters", cleanAadhaar), { isDefaulter: false, unmarkedAt: new Date().toISOString() }, { merge: true });
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating defaulter status:", error);
    checkAndHandleError(error, OperationType.WRITE, `applications/${applicationId}`);
    return { success: false, error };
  }
}

// Update Application processing status (e.g., APPROVED, REJECTED)
export async function updateApplicationStatus(id: string, status: string) {
  try {
    const appRef = doc(db, "applications", id);
    await updateDoc(appRef, { status });
    return { success: true };
  } catch (error) {
    console.error("Error updating application status:", error);
    checkAndHandleError(error, OperationType.WRITE, `applications/${id}`);
    return { success: false, error };
  }
}

// Get all applications for Admin Panel
export async function getAllApplications() {
  try {
    const snap = await getDocs(collection(db, "applications"));
    const list: any[] = [];
    snap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort by createdAt descending
    list.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dbVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dbVal - da;
    });
    return list;
  } catch (error) {
    console.error("Error getting applications:", error);
    checkAndHandleError(error, OperationType.LIST, "applications");
    return [];
  }
}

// Get user's application by email
export async function getUserApplication(email: string) {
  try {
    const q = query(
      collection(db, "applications"),
      where("email", "==", email.toLowerCase().trim())
    );
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort by createdAt descending
    list.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dbVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dbVal - da;
    });
    return list[0] || null; // return the most recent one
  } catch (error) {
    console.error("Error getting user application:", error);
    checkAndHandleError(error, OperationType.LIST, "applications");
    return null;
  }
}

// Get all private admin notes for a specific application
export async function getAdminNotes(applicationId: string) {
  try {
    const notesRef = collection(db, "applications", applicationId, "adminNotes");
    const snap = await getDocs(notesRef);
    const list: any[] = [];
    snap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort by createdAt descending (newest notes first)
    list.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dbVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dbVal - da;
    });
    return list;
  } catch (error) {
    console.error("Error getting admin notes:", error);
    checkAndHandleError(error, OperationType.LIST, `applications/${applicationId}/adminNotes`);
    return [];
  }
}

// Add a private admin note to an application
export async function addAdminNote(applicationId: string, note: string, adminEmail: string) {
  try {
    const notesRef = collection(db, "applications", applicationId, "adminNotes");
    const newNoteDoc = doc(notesRef); // auto-generate ID
    const noteData = {
      id: newNoteDoc.id,
      applicationId,
      note,
      createdBy: adminEmail || "Admin",
      createdAt: new Date().toISOString()
    };
    await setDoc(newNoteDoc, noteData);
    return { success: true, note: noteData };
  } catch (error) {
    console.error("Error adding admin note:", error);
    checkAndHandleError(error, OperationType.WRITE, `applications/${applicationId}/adminNotes`);
    return { success: false, error };
  }
}

// Delete a private admin note
export async function deleteAdminNote(applicationId: string, noteId: string) {
  try {
    const noteRef = doc(db, "applications", applicationId, "adminNotes", noteId);
    await deleteDoc(noteRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting admin note:", error);
    checkAndHandleError(error, OperationType.DELETE, `applications/${applicationId}/adminNotes/${noteId}`);
    return { success: false, error };
  }
}

export default app;
