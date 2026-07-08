export interface PinCodeRecord {
  pin: string;
  city: string;
  state: string;
  office: string;
}

export const pinCodeDataset: PinCodeRecord[] = [
  // 1. Andhra Pradesh
  { pin: "530001", city: "Visakhapatnam", state: "Andhra Pradesh", office: "Visakhapatnam Port Trust" },
  { pin: "520001", city: "Vijayawada", state: "Andhra Pradesh", office: "Vijayawada HO" },
  { pin: "515001", city: "Anantapur", state: "Andhra Pradesh", office: "Anantapur HO" },
  { pin: "524001", city: "Nellore", state: "Andhra Pradesh", office: "Nellore HO" },

  // 2. Arunachal Pradesh
  { pin: "791111", city: "Itanagar", state: "Arunachal Pradesh", office: "Itanagar SO" },
  { pin: "791102", city: "Yupia", state: "Arunachal Pradesh", office: "Yupia BO" },
  { pin: "792001", city: "Tezu", state: "Arunachal Pradesh", office: "Tezu SO" },

  // 3. Assam
  { pin: "781001", city: "Guwahati", state: "Assam", office: "Guwahati GPO" },
  { pin: "786001", city: "Dibrugarh", state: "Assam", office: "Dibrugarh HO" },
  { pin: "785001", city: "Jorhat", state: "Assam", office: "Jorhat HO" },
  { pin: "788001", city: "Silchar", state: "Assam", office: "Silchar HO" },

  // 4. Bihar
  { pin: "800001", city: "Patna", state: "Bihar", office: "Patna GPO" },
  { pin: "842001", city: "Muzaffarpur", state: "Bihar", office: "Muzaffarpur HO" },
  { pin: "823001", city: "Gaya", state: "Bihar", office: "Gaya HO" },
  { pin: "846004", city: "Darbhanga", state: "Bihar", office: "Darbhanga HO" },

  // 5. Chhattisgarh
  { pin: "492001", city: "Raipur", state: "Chhattisgarh", office: "Raipur HO" },
  { pin: "495001", city: "Bilaspur", state: "Chhattisgarh", office: "Bilaspur HO" },
  { pin: "490001", city: "Bhilai", state: "Chhattisgarh", office: "Bhilai HO" },

  // 6. Goa
  { pin: "403001", city: "Panaji", state: "Goa", office: "Panaji HO" },
  { pin: "403601", city: "Margao", state: "Goa", office: "Margao HO" },
  { pin: "403507", city: "Mapusa", state: "Goa", office: "Mapusa SO" },

  // 7. Gujarat
  { pin: "380001", city: "Ahmedabad", state: "Gujarat", office: "Ahmedabad GPO" },
  { pin: "390001", city: "Vadodara", state: "Gujarat", office: "Vadodara HO" },
  { pin: "395003", city: "Surat", state: "Gujarat", office: "Surat HO" },
  { pin: "360001", city: "Rajkot", state: "Gujarat", office: "Rajkot HO" },

  // 8. Haryana
  { pin: "121001", city: "Faridabad", state: "Haryana", office: "Faridabad NIT" },
  { pin: "122001", city: "Gurugram", state: "Haryana", office: "Gurugram HO" },
  { pin: "124001", city: "Rohtak", state: "Haryana", office: "Rohtak HO" },
  { pin: "133001", city: "Ambala", state: "Haryana", office: "Ambala Cantt HO" },

  // 9. Himachal Pradesh
  { pin: "171001", city: "Shimla", state: "Himachal Pradesh", office: "Shimla GPO" },
  { pin: "176215", city: "Dharamshala", state: "Himachal Pradesh", office: "Dharamshala SO" },
  { pin: "175001", city: "Mandi", state: "Himachal Pradesh", office: "Mandi HO" },

  // 10. Jharkhand
  { pin: "834001", city: "Ranchi", state: "Jharkhand", office: "Ranchi GPO" },
  { pin: "831001", city: "Jamshedpur", state: "Jharkhand", office: "Tatanagar HO" },
  { pin: "826001", city: "Dhanbad", state: "Jharkhand", office: "Dhanbad HO" },

  // 11. Karnataka
  { pin: "560001", city: "Bengaluru", state: "Karnataka", office: "Bengaluru GPO" },
  { pin: "575001", city: "Mangaluru", state: "Karnataka", office: "Mangaluru HO" },
  { pin: "570001", city: "Mysuru", state: "Karnataka", office: "Mysuru HO" },
  { pin: "580001", city: "Hubballi", state: "Karnataka", office: "Hubli HO" },

  // 12. Kerala
  { pin: "695001", city: "Thiruvananthapuram", state: "Kerala", office: "Trivandrum GPO" },
  { pin: "682001", city: "Kochi", state: "Kerala", office: "Ernakulam Head Post Office" },
  { pin: "673001", city: "Kozhikode", state: "Kerala", office: "Calicut HO" },
  { pin: "680001", city: "Thrissur", state: "Kerala", office: "Thrissur HO" },

  // 13. Madhya Pradesh
  { pin: "462001", city: "Bhopal", state: "Madhya Pradesh", office: "Bhopal GTB Complex" },
  { pin: "452001", city: "Indore", state: "Madhya Pradesh", office: "Indore GPO" },
  { pin: "482001", city: "Jabalpur", state: "Madhya Pradesh", office: "Jabalpur HO" },
  { pin: "474001", city: "Gwalior", state: "Madhya Pradesh", office: "Gwalior HO" },

  // 14. Maharashtra
  { pin: "400001", city: "Mumbai", state: "Maharashtra", office: "Mumbai GPO" },
  { pin: "411001", city: "Pune", state: "Maharashtra", office: "Pune GPO" },
  { pin: "440001", city: "Nagpur", state: "Maharashtra", office: "Nagpur GPO" },
  { pin: "400601", city: "Thane", state: "Maharashtra", office: "Thane HO" },

  // 15. Manipur
  { pin: "795001", city: "Imphal", state: "Manipur", office: "Imphal HO" },
  { pin: "795138", city: "Churachandpur", state: "Manipur", office: "Churachandpur SO" },

  // 16. Meghalaya
  { pin: "793001", city: "Shillong", state: "Meghalaya", office: "Shillong GPO" },
  { pin: "794001", city: "Tura", state: "Meghalaya", office: "Tura HO" },

  // 17. Mizoram
  { pin: "796001", city: "Aizawl", state: "Mizoram", office: "Aizawl HO" },
  { pin: "796701", city: "Lunglei", state: "Mizoram", office: "Lunglei SO" },

  // 18. Nagaland
  { pin: "797001", city: "Kohima", state: "Nagaland", office: "Kohima HO" },
  { pin: "797112", city: "Dimapur", state: "Nagaland", office: "Dimapur SO" },

  // 19. Odisha
  { pin: "751001", city: "Bhubaneswar", state: "Odisha", office: "Bhubaneswar GPO" },
  { pin: "753001", city: "Cuttack", state: "Odisha", office: "Cuttack HO" },
  { pin: "769001", city: "Rourkela", state: "Odisha", office: "Rourkela HO" },
  { pin: "768001", city: "Sambalpur", state: "Odisha", office: "Sambalpur HO" },
  { pin: "759122", city: "Angul", state: "Odisha", office: "Angul HO" },
  { pin: "767001", city: "Balangir", state: "Odisha", office: "Balangir HO" },
  { pin: "756001", city: "Balasore", state: "Odisha", office: "Balasore HO" },
  { pin: "768028", city: "Bargarh", state: "Odisha", office: "Bargarh HO" },
  { pin: "756100", city: "Bhadrak", state: "Odisha", office: "Bhadrak HO" },
  { pin: "762014", city: "Boudh", state: "Odisha", office: "Boudh Raj SO" },
  { pin: "768108", city: "Deogarh", state: "Odisha", office: "Deogarh SO" },
  { pin: "759001", city: "Dhenkanal", state: "Odisha", office: "Dhenkanal HO" },
  { pin: "761200", city: "Paralakhemundi", state: "Odisha", office: "Paralakhemundi HO" },
  { pin: "760001", city: "Berhampur", state: "Odisha", office: "Berhampur HO" },
  { pin: "754103", city: "Jagatsinghpur", state: "Odisha", office: "Jagatsinghpur HO" },
  { pin: "755001", city: "Jajpur", state: "Odisha", office: "Jajpur HO" },
  { pin: "768201", city: "Jharsuguda", state: "Odisha", office: "Jharsuguda HO" },
  { pin: "766001", city: "Bhawanipatna", state: "Odisha", office: "Bhawanipatna HO" },
  { pin: "762001", city: "Phulbani", state: "Odisha", office: "Phulbani HO" },
  { pin: "754211", city: "Kendrapara", state: "Odisha", office: "Kendrapara HO" },
  { pin: "758001", city: "Keonjhar", state: "Odisha", office: "Keonjhar HO" },
  { pin: "752055", city: "Khurda", state: "Odisha", office: "Khurda HO" },
  { pin: "764020", city: "Koraput", state: "Odisha", office: "Koraput HO" },
  { pin: "764045", city: "Malkangiri", state: "Odisha", office: "Malkangiri HO" },
  { pin: "757001", city: "Baripada", state: "Odisha", office: "Baripada HO" },
  { pin: "764059", city: "Nabarangpur", state: "Odisha", office: "Nabarangpur HO" },
  { pin: "752069", city: "Nayagarh", state: "Odisha", office: "Nayagarh HO" },
  { pin: "766105", city: "Nuapada", state: "Odisha", office: "Nuapada SO" },
  { pin: "752001", city: "Puri", state: "Odisha", office: "Puri HO" },
  { pin: "765001", city: "Rayagada", state: "Odisha", office: "Rayagada HO" },
  { pin: "767017", city: "Sonepur", state: "Odisha", office: "Sonepur HO" },
  { pin: "770001", city: "Sundargarh", state: "Odisha", office: "Sundargarh HO" },

  // 20. Punjab
  { pin: "141001", city: "Ludhiana", state: "Punjab", office: "Ludhiana HO" },
  { pin: "143001", city: "Amritsar", state: "Punjab", office: "Amritsar HO" },
  { pin: "147001", city: "Patiala", state: "Punjab", office: "Patiala HO" },
  { pin: "144001", city: "Jalandhar", state: "Punjab", office: "Jalandhar City HO" },

  // 21. Rajasthan
  { pin: "302001", city: "Jaipur", state: "Rajasthan", office: "Jaipur GPO" },
  { pin: "342001", city: "Jodhpur", state: "Rajasthan", office: "Jodhpur HO" },
  { pin: "305001", city: "Ajmer", state: "Rajasthan", office: "Ajmer HO" },
  { pin: "313001", city: "Udaipur", state: "Rajasthan", office: "Udaipur Shastri Circle" },

  // 22. Sikkim
  { pin: "737101", city: "Gangtok", state: "Sikkim", office: "Gangtok HO" },
  { pin: "737121", city: "Namchi", state: "Sikkim", office: "Namchi SO" },

  // 23. Tamil Nadu
  { pin: "600001", city: "Chennai", state: "Tamil Nadu", office: "Chennai GPO" },
  { pin: "641001", city: "Coimbatore", state: "Tamil Nadu", office: "Coimbatore HO" },
  { pin: "625001", city: "Madurai", state: "Tamil Nadu", office: "Madurai HO" },
  { pin: "620001", city: "Tiruchirappalli", state: "Tamil Nadu", office: "Teppakulam HO" },

  // 24. Telangana
  { pin: "500001", city: "Hyderabad", state: "Telangana", office: "Hyderabad GPO" },
  { pin: "506001", city: "Warangal", state: "Telangana", office: "Hanamkonda HO" },
  { pin: "505001", city: "Karimnagar", state: "Telangana", office: "Karimnagar HO" },

  // 25. Tripura
  { pin: "799001", city: "Agartala", state: "Tripura", office: "Agartala HO" },
  { pin: "799120", city: "Dharmanagar", state: "Tripura", office: "Dharmanagar SO" },

  // 26. Uttar Pradesh
  { pin: "226001", city: "Lucknow", state: "Uttar Pradesh", office: "Lucknow GPO" },
  { pin: "208001", city: "Kanpur", state: "Uttar Pradesh", office: "Kanpur HO" },
  { pin: "201301", city: "Noida", state: "Uttar Pradesh", office: "Noida Sector 30" },
  { pin: "243001", city: "Bareilly", state: "Uttar Pradesh", office: "Bareilly HO" },

  // 27. Uttarakhand
  { pin: "248001", city: "Dehradun", state: "Uttarakhand", office: "Dehradun GPO" },
  { pin: "263139", city: "Haldwani", state: "Uttarakhand", office: "Haldwani SO" },
  { pin: "249401", city: "Haridwar", state: "Uttarakhand", office: "Haridwar SO" },

  // 28. West Bengal
  { pin: "700001", city: "Kolkata", state: "West Bengal", office: "Kolkata GPO" },
  { pin: "711101", city: "Howrah", state: "West Bengal", office: "Howrah HO" },
  { pin: "734001", city: "Siliguri", state: "West Bengal", office: "Siliguri HO" },
  { pin: "713301", city: "Asansol", state: "West Bengal", office: "Asansol HO" },

  // Union Territories
  // 1. Andaman & Nicobar
  { pin: "744101", city: "Port Blair", state: "Andaman and Nicobar Islands", office: "Port Blair HO" },
  { pin: "744202", city: "Car Nicobar", state: "Andaman and Nicobar Islands", office: "Car Nicobar SO" },

  // 2. Chandigarh
  { pin: "160017", city: "Chandigarh", state: "Chandigarh", office: "Chandigarh Sector 17 HO" },
  { pin: "160036", city: "Chandigarh", state: "Chandigarh", office: "Chandigarh Sector 36 SO" },

  // 3. Dadra & Nagar Haveli and Daman & Diu
  { pin: "396230", city: "Silvassa", state: "Dadra and Nagar Haveli and Daman and Diu", office: "Silvassa SO" },
  { pin: "396210", city: "Daman", state: "Dadra and Nagar Haveli and Daman and Diu", office: "Daman SO" },
  { pin: "362520", city: "Diu", state: "Dadra and Nagar Haveli and Daman and Diu", office: "Diu SO" },

  // 4. Delhi
  { pin: "110001", city: "New Delhi", state: "Delhi", office: "New Delhi GPO" },
  { pin: "110016", city: "New Delhi", state: "Delhi", office: "Hauz Khas SO" },
  { pin: "110092", city: "New Delhi", state: "Delhi", office: "Nirman Vihar SO" },

  // 5. Jammu & Kashmir
  { pin: "190001", city: "Srinagar", state: "Jammu and Kashmir", office: "Srinagar GPO" },
  { pin: "180001", city: "Jammu", state: "Jammu and Kashmir", office: "Jammu HO" },

  // 6. Ladakh
  { pin: "194101", city: "Leh", state: "Ladakh", office: "Leh SO" },
  { pin: "194103", city: "Kargil", state: "Ladakh", office: "Kargil SO" },

  // 7. Lakshadweep
  { pin: "682555", city: "Kavaratti", state: "Lakshadweep", office: "Kavaratti SO" },
  { pin: "682556", city: "Minicoy", state: "Lakshadweep", office: "Minicoy SO" },

  // 8. Puducherry
  { pin: "605001", city: "Puducherry", state: "Puducherry", office: "Pondicherry HO" },
  { pin: "609602", city: "Karaikal", state: "Puducherry", office: "Karaikal SO" }
];
