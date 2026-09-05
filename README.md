# Back to school

​Prompt: Build "Adha Charity" Donation Platform - Al-Kalima Al-Tayiba Charity
​Role: Expert Full-Stack Web Developer (Softr + Airtable/Google Sheets).
Task: Update the existing donation platform from "Eid Clothing" to the Eid al-Adha project named "ضْحِيِّتْنَا".
​1. Hero Section (Landing Page):
​Main Title: ضْحِيِّتْنَا (with Tajweed/Diacritics for correct Tunisian pronunciation).
​Persuasive Message: "بمساهمتكم.. نفرحو عائلاتنا ونعظمو الشعيرة في صفاقس."
​Total Goal: 30,000 TND (for buying livestock).
​Dynamic Progress Bar: Displays percentage of the 30,000 TND goal collected.
​2. Donation Logic (Two Main Tracks):
​Step 1: Choose Contribution Type:
​Option A: [مساهمة مالية]
​Sub-options: (سهم بـ 50 د) / (سهم بـ 100 د) / (مبلغ حر).
​Purpose: To reach the 30,000 TND goal for buying sheep.
​Option B: [صدقة الأكتاف - يوم العيد]
​Question: كيف ستصلنا الصدقة؟
​Sub-option 1: "سآتي للمقر" (ساقية الدائر - من 10:00 إلى المغرب).
​Sub-option 2: "جيو خوذوها مني" (Available within 15km of Sakiet Eddaier only).
​Step 2: Logistical Details (For Option B - Sub-option 2 only):
​Mandatory Fields: * Full Name + Phone Number.
​Pickup Time (Available between 13:00 and 18:00).
​Location: Mandatory Google Maps/GPS link field.
​Step 3: Payment Method (For Option A only):
​Options: (Cash, Bank Transfer, Check).
​3. Backend Structure (Airtable/Sheets):
​New Columns needed: [Project_Type: Adha] | [Pickup_Required: Yes/No] | [GPS_Location] | [Pickup_Time].
​4. Success Page (Tunisian Arabic Message):
​"بارك الله في رزقك.. مساهمتك في (ضْحِيِّتْنَا) وصلت لجمعية الكلمة الطيبة. فريق المتطوعين سيتصل بك قريباً لتنسيق الاستلام (خاصة لصدقة الأكتاف). عيدكم مبروك مسبقاً!"
​5. UI/UX Style:
​Maintain the current responsive mobile-friendly style but update imagery to reflect Eid al-Adha (Sheep/Sacrifice theme). the photo is the logo of charity and this The example of Loeb has a style similar to what I want " https://donationramadhan.lovable.app/ " and this is his code in github " https://github.com/AnasHbaieb/donationramadhan "

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rentree-scolaire.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/29d49fb4-8b71-4e38-bc5d-e5e47aafa2a7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
