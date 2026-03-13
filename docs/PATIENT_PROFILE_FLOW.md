# Patient Profile Flow & Links in Hospital System

इस डॉक्यूमेंट में समझाया गया है कि एक हॉस्पिटल प्रोजेक्ट में "Patient" या मरीज कहां-कहां लिंक होता है, पूरे फ्लो में उसके साथ क्या-क्या मॉड्यूल जुड़े होते हैं और जब हम patient का profile open करते हैं तो कौन-कौनसी जानकारी global स्तर पर दिखाई जानी चाहिए।

---

## 1. मरीज का जुड़ाव (Links) और पूरे फ्लो के मॉड्यूल

एक hospital information management system (HIMS) में patient कई जगहों से जुड़ा होता है।

1. **Registration / Master Data**
   - बेसिक व्यक्तिगत जानकारी (नाम, आयु, लिंग, फ़ोन, पता, ईमेल)
   - पहचान (Aadhar, पासपोर्ट, MRN)
   - बीमा / payment source
   - प्राथमिक डॉक्टर्स या रेकमेंडेशन
   - Registration date / source (OPD, IPD, ER)

2. **Appointments / OPD**
   - OPD अपॉइंटमेंट शेड्यूलिंग, cancellations, walk-ins
   - डॉक्टर/specialist के साथ link
   - रजिस्ट्रेशन और visit history

3. **Encounters**
   - प्रत्येक clinical interaction (OPD, IPD, ER)
   - encounter notes, diagnoses, procedures
   - vitals, orders, medications

4. **Billing & Payments**
   - appointment charges, consultation fees, procedures
   - invoices, payments (cash/insurance/credit)
   - refunds, pending balances

5. **Lab & Diagnostics**
   - test orders, sample collection, results
   - radiology orders, reports
   - link to encounters

6. **Prescriptions & Medications**
   - medications prescribed in encounters
   - pharmacy orders, dispensation

7. **IPD (In-Patient) Flow**
   - admissions, bed assignment, transfers
   - rounds, nursing notes
   - discharge summaries, billing

8. **Pharmacy**
   - drug inventory linked to prescriptions
   - dispensation history per patient

9. **Other modules**
   - Documents and attachments (e.g., consent forms, reports)
   - Referrals, follow-ups
   - Communications/notifications (SMS, email)
   - Insurance claims

10. **Analytics / Reports**
   - patient utilization stats, appointment trends

---

## 2. Patient Profile खोलने पर दिखाई जाने वाली डिटेल्स

जब हॉस्पिटल सिस्टम में किसी patient का प्रोफाइल ओपन किया जाता है, तो निम्न लेवल की जानकारी global रूप से उपलब्ध होनी चाहिए:

### 2.1 प्राथमिक पहचान (Basic Identity)
- पूर्ण नाम, आयु/जन्म तिथि, लिंग
- मरीज ID / MRN
- फ़ोटो (यदि उपलब्ध)
- संपर्क जानकारी (मोबाइल, ईमेल, पता)

### 2.2 पंजीकरण विवरण
- पंजीकरण की तारीख
- पहले से जुड़ी पहचान (Aadhar, PAN)
- प्रकृति (OPD/IPD/ER), रजिस्ट्रेशन स्रोत

### 2.3 स्वास्थ्य व बीमा विवरण
- बीमा कम्पनी / पॉलिसी नंबर
- एलर्जी, प्रमुख चिकित्सा स्थिति
- रक्त समूह

### 2.4 वर्तमान/हाल के प्रवाह
- यदि IPD में भर्ती है तो ward/bed
- अगली अपॉइंटमेंट्स
- सक्रिय encounters / orders

### 2.5 विज़िट/एन्काउंटर इतिहास
- पिछले OPD visits / IPD admissions की लिस्ट
- प्रत्येक एन्काउंटर की तारीख, विभाग, डॉक्टर

### 2.6 बिलिंग स्थिति
- कुल बकाया / एडवांस
- हाल की invoice summary

### 2.7 डॉक्टर/केयर टीम
- प्राथमिक डाक्टर
- देखभाल टीम के सदस्य

### 2.8 अतिरिक्त नोट्स
- स्टाफ/नर्स नोट
- संवेदनशील चेतावनियाँ (do not resuscitate, fall risk)

### 2.9 दस्तावेज़ और रिपोर्ट्स (Quick links)
- लेब रिपोर्ट्स, रेन्ट जिंन्स, पीडीएफ attachments

> **नोट:** प्रोफ़ाइल पेज अक्सर एक ओर लेफ़्ट सेक्शन पर सारांश दिखाता है और दाईं ओर एंकाउंटर/रिपोर्ट्स/बिलिंग history के टैब्स।

---

## 3. ग्लोबल लेवल पर क्या दिखाएँ (Hospital side requirements)

1. **सिंगल-क्लिक नेविगेशन**: जहाँ से भी किसी मॉड्यूल से मरीज को देखें (appointment list, lab orders, invoice), क्लिक पर उसका प्रोफ़ाइल खुलना चाहिए।
2. **स्टेट-लेस कॉम्पोनेन्ट**: मोबाइल/वेब दोनों पर प्रोफ़ाइल समान यूआई/डाटा प्रदर्शित करे।
3. **प्राइवेसी और सुरक्षा**: मरीज की संवेदनशील जानकारी अर्थात् PII केवल अधिकृत उपयोगकर्ताओं को दिखे। लॉग ऑडिटेड हो।
4. **रीयल-टाइम अपडेट**: नए encounters, बिल्स, रिपोर्ट्स, या बदलाव तुरंत प्रोफ़ाइल में परिलक्षित हो (WebSockets/Polling)।
5. **कस्टमाइजेबल व्यू**: अस्पताल की पॉलिसी/देस के अनुसार additional fields (e.g., Aadhaar, facility-specific identifiers) डॉक्यूमेंट करें।
6. **ग्लोबल सर्च**: किसी भी पेज से patient search की सुविधा; परिणाम से प्रोफ़ाइल तक पहुंच।
7. **एक्सपोर्ट / शेयर**: पर्सनल डेटा को CSV/PDF या print-friendly view में एक्सपोर्ट करने का विकल्प।
8. **डॉक्टर्स/केयर टीम नोट्स**: प्रोफ़ाइल में care team के पास छोटे नोट्स या रिकमेंडेशन देखने को मिले।

---

## 4. प्रोफ़ाइल ओपन करने की जाँचें (Checklist)

- [ ] नाम, आयु/जेंडर सही दिख रहा है?
- [ ] संपर्क और पंजीकरण जानकारी यहाँ है?
- [ ] एलर्जी/मेडिकल अलर्ट मौजूद हैं?
- [ ] वर्तमान स्टेटस (IPD/OPD/Discharged) स्पष्ट है?
- [ ] पिछले सभी विज़िट/एन्काउंटर उपलब्ध हैं?
- [ ] बिलिंग summary, pending amount दिखाई दे रहा है?
- [ ] बीमा/पैमेन्ट सोर्स detail मौजूद है?
- [ ] मरीज की photograph/ID कार्ड ठीक से लोड हो रही है?
- [ ] उपयोगकर्ता अधिकारों के अनुसार संवेदनशील डाटा hide/show हो रहा है?
- [ ] डॉक्यूमेंट्स और रिपोर्ट्स के लिंक काम कर रहे हैं?

---

## 5. UI/UX सुझाव (Hospital side view)

- **Summary कार्ड**: सामने सबसे प्रमुख जानकारी (नाम, उम्र, MRN, स्थिति) एक कार्ड में रखें।
- **टैब-बेस्ड नेविगेशन**: Details (Profile), Encounters, Billing, Documents, Insurance आदि अलग टैब में रखें।
- **Quick Actions**: नया encounter जोड़ें, नया बिल, अपॉइंटमेंट बुक करें बटन प्रोफ़ाइल पर उपलब्ध हों।
- **Responsive design**: मोबाइल/टैब के लिए लिस्ट व्यू, कार्ड व्यू स्विच।

---

> यह डॉक़्यूमेंट पूरे हॉस्पिटल वर्कफ़्लो में मरीज की ज़रूरत के अनुसार एडजस्ट और एक्स्टेंड किया जा सकता है।

---

© 2026 Scanbo Matrix HIMS Documentation
