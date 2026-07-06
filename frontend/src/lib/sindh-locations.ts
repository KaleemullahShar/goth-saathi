/**
 * Sindh's 30 districts and their 138 tehsils (locally called "talukas").
 * Used to drive the cascading District -> Tehsil -> Village registration
 * flow. This is static geographic reference data, not user-editable, so it
 * lives in the frontend rather than the database.
 */
export const SINDH_DISTRICTS_TEHSILS: Record<string, string[]> = {
  Badin: ["Badin", "Matli", "Shaheed Fazil Rahu", "Talhar", "Tando Bago"],
  Sujawal: ["Jati", "Kharo Chan", "Mirpur Bathoro", "Shah Bandar", "Sujawal"],
  Thatta: ["Ghorabari", "Keti Bunder", "Mirpur Sakro", "Thatta"],
  Dadu: ["Dadu", "Johi", "Khairpur Nathan Shah", "Mehar"],
  Hyderabad: ["Hyderabad City", "Hyderabad", "Latifabad", "Qasimabad"],
  Jamshoro: ["Kotri", "Sehwan", "Manjhand", "Thana Bulla Khan"],
  Matiari: ["Hala", "Matiari", "Saeedabad"],
  "Tando Allahyar": ["Chamber", "Jhando Mari", "Tando Allahyar"],
  "Tando Muhammad Khan": ["Bulri Shah Karim", "Tando Ghulam Hyder", "Tando Muhammad Khan"],
  "Karachi Central": ["Gulberg Town", "Liaquatabad Town", "New Karachi Town", "North Nazimabad Town", "Nazimabad"],
  "Karachi East": ["Jamshed Town", "Ferozabad", "Gulshan-e-Iqbal", "Gulzar-e-Hijri"],
  "Karachi South": ["Lyari Town", "Saddar Town", "Aram Bagh", "Civil Line", "Garden"],
  "Karachi West": ["Orangi Town", "Manghopir", "Mominabad"],
  Korangi: ["Korangi Town", "Landhi Town", "Shah Faisal Town", "Model Colony"],
  Malir: ["Bin Qasim", "Gadap Town", "Airport", "Ibrahim Hyderi", "Murad Memon Goth", "Shah Mureed"],
  Keamari: ["Keamari Town", "Baldia Town", "S.I.T.E. Town", "Maripur"],
  Jacobabad: ["Garhi Khairo", "Jacobabad", "Thul"],
  Kashmore: ["Kandhkot", "Kashmore", "Tangwani"],
  Larkana: ["Bakrani", "Dokri", "Larkana", "Ratodero"],
  "Qambar Shahdadkot": ["Mirokhan", "Nasirabad", "Qambar", "Qubo Saeed Khan", "Shahdadkot", "Sijawal Junejo", "Warah"],
  Shikarpur: ["Garhi Yasin", "Khanpur", "Lakhi", "Shikarpur"],
  Ghotki: ["Daharki", "Ghotki", "Khan Garh (Khanpur)", "Mirpur Mathelo", "Ubauro"],
  Khairpur: ["Faiz Ganj", "Gambat", "Khairpur", "Kingri", "Kot Diji", "Nara", "Sobho Dero", "Thari Mirwah"],
  Sukkur: ["New Sukkur", "Pano Akil", "Rohri", "Salehpat", "Sukkur"],
  "Naushahro Feroze": ["Bhiria", "Kandiaro", "Mehrabpur", "Moro", "Naushahro Feroze"],
  "Shaheed Benazirabad": ["Kazi Ahmed", "Daur", "Nawabshah", "Sakrand"],
  Sanghar: ["Jam Nawaz Ali", "Khipro", "Sanghar", "Shahdadpur", "Sinjhoro", "Tando Adam Khan"],
  "Mirpur Khas": ["Digri", "Hussain Bux Mari", "Jhuddo", "Kot Ghulam Muhammad", "Mirpur Khas", "Shujabad", "Sindhri"],
  Tharparkar: ["Chachro", "Dahli", "Diplo", "Islamkot", "Kaloi", "Mithi", "Nagarparkar"],
  Umerkot: ["Kunri", "Pithoro", "Samaro", "Umerkot"],
};

export const SINDH_DISTRICTS = Object.keys(SINDH_DISTRICTS_TEHSILS).sort();
