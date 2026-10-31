/** Every piece of text on the site, in both languages. Add a key here, then use `t('key')`. */
export type Lang = 'bn' | 'en'

export const STRINGS = {
  // header & navigation
  'nav.home': { bn: 'হোম', en: 'Home' },
  'nav.map': { bn: 'ভ্রমণ ম্যাপ', en: 'Travel map' },
  'nav.aria': { bn: 'প্রধান নেভিগেশন', en: 'Main navigation' },
  'menu.open': { bn: 'মেনু খুলুন', en: 'Open menu' },
  'menu.close': { bn: 'মেনু বন্ধ করুন', en: 'Close menu' },
  'chip.seen': { bn: 'দেখা হয়েছে', en: 'seen' },
  'chip.title': { bn: 'আপনার অগ্রগতি দেখুন', en: 'See your progress' },
  'cta.openMap': { bn: 'ম্যাপ খুলুন', en: 'Open map' },
  'lang.label': { bn: 'ভাষা', en: 'Language' },

  // hero
  'hero.line1': { bn: 'নওগাঁর কতগুলো জায়গা', en: 'How many places of Naogaon' },
  'hero.line2': { bn: 'ঘুরে দেখেছেন?', en: 'have you explored?' },
  'hero.lead': {
    bn: 'পাহাড়পুরের বিহার থেকে জবাইবিলের জলরাশি — নওগাঁর ঐতিহ্য, প্রকৃতি আর ইতিহাস এক মানচিত্রে। যেখানে গেছেন সেখানে রং দিন, আর নিজের ভ্রমণের মানচিত্র বন্ধুদের সাথে শেয়ার করুন।',
    en: 'From the vihara at Paharpur to the waters of Jobai Beel — the heritage, nature and history of Naogaon on one map. Colour in the places you have been, and share your travel map with friends.',
  },
  'hero.cta': { bn: 'মানচিত্রে রং দিন', en: 'Colour your map' },
  'hero.progress.none': { bn: 'এখনো শুরু হয়নি — প্রথম স্থানটি বেছে নিন', en: 'Not started yet — pick your first place' },
  'hero.progress.some': { bn: 'আপনি {n}টি স্থান দেখেছেন', en: 'You have seen {n} places' },
  'hero.pinHint': { bn: 'কোনো পিনে ছুঁয়ে দেখুন', en: 'Touch a pin to see the place' },
  'hero.mapAria': { bn: 'নওগাঁ জেলার মানচিত্রে দর্শনীয় স্থানগুলো', en: 'The places of Naogaon district on the map' },
  'hero.photo': { bn: 'পাহাড়পুর · ছবি:', en: 'Paharpur · Photo:' },

  // stats
  'stat.places': { bn: 'দর্শনীয় স্থান', en: 'Places to see' },
  'stat.upazilas': { bn: 'উপজেলা', en: 'Upazilas' },
  'stat.unions': { bn: 'ইউনিয়ন ও পৌরসভা', en: 'Unions & municipalities' },
  'stat.seen': { bn: 'আপনি দেখেছেন', en: 'You have seen' },

  // map section
  'map.kicker': { bn: 'ভ্রমণ ম্যাপ', en: 'Travel map' },
  'map.title': { bn: 'যেখানে গেছেন, সেখানে রং দিন', en: 'Colour in where you have been' },
  'map.lead': {
    bn: 'তালিকার নামে বা মানচিত্রের কোনো অঞ্চলে ক্লিক করলে সেটি “দেখা” হবে। রং, নাম ও ছবি বদলে নিজের মানচিত্র ডাউনলোড করুন।',
    en: 'Click a name in the list or a region on the map to mark it as seen. Change the colours, add your name and photo, then download your own map.',
  },
  'map.loading': { bn: 'মানচিত্র তৈরি হচ্ছে…', en: 'Building the map…' },
  'map.error': { bn: 'মানচিত্রের অঞ্চল তৈরি করা যায়নি। পরে আবার চেষ্টা করুন।', en: 'The map regions could not be built. Please try again later.' },
  'map.note': {
    bn: 'রঙিন অঞ্চলগুলো ভিজ্যুয়াল ট্র্যাকিং এলাকা, প্রকৃত সাইট-সীমানা নয়',
    en: 'The coloured areas are visual tracking zones, not the actual boundaries of the sites',
  },
  'map.tip': { bn: 'টিপ: মানচিত্রের অঞ্চলে ক্লিক করেও জায়গা বেছে নিতে পারেন।', en: 'Tip: you can also tap a region on the map to select it.' },
  'map.aria': { bn: 'নওগাঁ জেলার ভৌগোলিক ভ্রমণ মানচিত্র', en: 'Geographic travel map of Naogaon district' },

  // list
  'list.aria': { bn: 'দর্শনীয় স্থানের তালিকা', en: 'List of places' },
  'list.search': { bn: 'স্থান খুঁজুন…', en: 'Search places…' },
  'list.filter.aria': { bn: 'স্থান ফিল্টার', en: 'Place filter' },
  'list.filter.all': { bn: 'সব', en: 'All' },
  'list.filter.seen': { bn: 'দেখেছি', en: 'Seen' },
  'list.filter.todo': { bn: 'বাকি', en: 'To do' },
  'list.markAll': { bn: 'সব দেখা', en: 'Mark all seen' },
  'list.clearAll': { bn: 'সব মুছুন', en: 'Clear all' },
  'list.empty': { bn: 'কিছু পাওয়া যায়নি', en: 'Nothing found' },
  'list.seenAria': { bn: '{name} — দেখা হয়েছে, বাতিল করতে ক্লিক করুন', en: '{name} — seen, click to undo' },
  'list.todoAria': { bn: '{name} — দেখেছি হিসেবে চিহ্নিত করতে ক্লিক করুন', en: '{name} — click to mark as seen' },

  // studio controls
  'studio.theme': { bn: 'থিম', en: 'Theme' },
  'studio.addPhoto': { bn: 'আপনার ছবি যোগ করুন', en: 'Add your photo' },
  'studio.changePhoto': { bn: 'ছবি বদলান', en: 'Change photo' },
  'studio.removePhoto': { bn: 'ছবি সরান', en: 'Remove photo' },
  'studio.photoAlt': { bn: 'আপনার বাছাই করা ছবি', en: 'Your chosen photo' },
  'studio.photoFail': { bn: 'ছবিটি খোলা যায়নি। অন্য একটি ছবি বেছে নিন।', en: 'That photo could not be opened. Please choose another one.' },
  'studio.name': { bn: 'আপনার নাম (ঐচ্ছিক)', en: 'Your name (optional)' },
  'studio.placeNames': { bn: 'স্থানের নাম', en: 'Place names' },
  'studio.download': { bn: 'আপনার ম্যাপ ডাউনলোড করুন', en: 'Download your map' },
  'studio.downloading': { bn: 'ম্যাপ তৈরি হচ্ছে…', en: 'Creating your map…' },
  'studio.downloaded': { bn: 'আপনার ম্যাপ ডাউনলোড হয়েছে।', en: 'Your map has been downloaded.' },
  'studio.downloadFail': { bn: 'ম্যাপ ডাউনলোড করা যায়নি। আবার চেষ্টা করুন।', en: 'The map could not be downloaded. Please try again.' },
  'studio.downloadNotReady': { bn: 'ম্যাপ ডাউনলোড প্রস্তুত করা যায়নি। আবার চেষ্টা করুন।', en: 'The download is not ready. Please try again.' },
  'studio.photoNote': { bn: 'ছবি আপনার ডিভাইসেই থাকে, কোথাও আপলোড হয় না।', en: 'Your photo stays on your device and is never uploaded.' },

  // poster
  'poster.title': { bn: 'হামাকে নওগাঁ', en: 'My Naogaon' },
  'poster.eyebrow': { bn: 'নওগাঁ ভ্রমণ ম্যাপ', en: 'Naogaon travel map' },
  'poster.eyebrowNamed': { bn: '{name}-এর নওগাঁ ভ্রমণ', en: "{name}'s Naogaon trip" },
  'poster.percent': { bn: '{n}% নওগাঁ ঘোরা হয়েছে', en: '{n}% of Naogaon explored' },
  'poster.counts': { bn: '{n}টি স্থান · ১১টি উপজেলার মধ্যে {u}টি উপজেলা', en: '{n} places · {u} of 11 upazilas' },
  'poster.calloutSub': { bn: 'মানচিত্র পূরণ করতে', en: 'To fill the map' },
  'poster.calloutMain': { bn: 'চলো ঘুরি, নওগাঁ জুড়ি', en: "Let's explore, let's cover Naogaon" },

  // footer
  'footer.tagline': { bn: 'নওগাঁকে জানুন · ঘুরে দেখুন · মানচিত্রে রাখুন', en: 'Know Naogaon · Explore it · Keep it on your map' },
  'footer.about': { bn: 'নওগাঁর মানুষের জন্য, নওগাঁর গল্প ছড়িয়ে দিতে।', en: 'For the people of Naogaon, to spread the stories of Naogaon.' },
  'footer.fb': { bn: 'Facebook পেজ', en: 'Facebook page' },
  'footer.fbSoon': { bn: 'Facebook পেজ শীঘ্রই আসছে', en: 'Facebook page coming soon' },
  'footer.pages': { bn: 'পাতাসমূহ', en: 'Pages' },
  'footer.sources': { bn: 'তথ্যসূত্র', en: 'Sources' },
  'footer.mapData': { bn: 'মানচিত্র-ডেটা: OpenStreetMap', en: 'Map data: OpenStreetMap' },
  'footer.boundary': { bn: 'সীমানা-ডেটা: BBS / OCHA (HDX), CC BY 3.0 IGO', en: 'Boundaries: BBS / OCHA (HDX), CC BY 3.0 IGO' },
  'footer.data': { bn: 'স্থানের তথ্য: স্থানীয় সংগ্রহ ও উন্মুক্ত উৎস', en: 'Place information: local collection and open sources' },
  'footer.rights': { bn: 'সর্বস্বত্ব সংরক্ষিত।', en: 'All rights reserved.' },
  'footer.madeWith': { bn: 'ভালোবাসায় তৈরি', en: 'Made with' },
  'footer.madeBy': { bn: 'নির্মাতা', en: 'By' },
  'footer.developer': { bn: 'মোঃ রায়হান আলী', en: 'Md Rayhan Ali' },

  // messages
  'toast.seen': { bn: '{name} দেখা হলো · {n}/{total}', en: '{name} marked as seen · {n}/{total}' },
  'storage.off': {
    bn: 'এই ব্রাউজারে স্থানীয় সংরক্ষণ বন্ধ। পৃষ্ঠা বন্ধ করলে আপনার ভ্রমণ-অগ্রগতি হারাতে পারেন।',
    en: 'Local storage is turned off in this browser. You may lose your progress when you close the page.',
  },

  // themes
  'theme.nature': { bn: 'প্রকৃতি সবুজ', en: 'Nature green' },
  'theme.blue': { bn: 'নীল আকাশ', en: 'Blue sky' },
  'theme.monochrome': { bn: 'মিনিমাল / সিমারেখা', en: 'Minimal / outline' },
  'theme.night': { bn: 'ডার্ক নেভি', en: 'Dark navy' },
  'theme.amber': { bn: 'উষ্ণ সূর্যাস্ত', en: 'Warm sunset' },

  // page meta
  'meta.title': { bn: 'Explore Naogaon — নওগাঁর দর্শনীয় স্থান ও ভ্রমণ ম্যাপ', en: 'Explore Naogaon — places to see and a travel map of Naogaon' },
} as const satisfies Record<string, Record<Lang, string>>

export type StringKey = keyof typeof STRINGS
