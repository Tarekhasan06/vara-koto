# ভাড়া কত?

ঢাকার বাসের সরকারি ভাড়ার চার্ট থেকে সঠিক ভাড়া জানার ওয়েব অ্যাপ। পুরো ইন্টারফেস বাংলায়।

**অ্যাপ খুলুন:** https://tarekhasan06.github.io/vara-koto/

## কী করা যায়

- কোথা থেকে উঠবেন আর কোথায় নামবেন বেছে নিলে সব সরাসরি রুট, দূরত্ব ও ভাড়া দেখায়।
- বাংলা ও English, দুই ভাষায় ব্যবহার করা যায়। স্টপেজের তালিকা বর্ণানুক্রমে সাজানো, দুই ভাষার নামই দেখায়, আর বাংলা বা ইংরেজি যেকোনোটিতে লিখে খোঁজা যায়।
- কোনো স্টপেজ একটি রুটের চার্টে আলাদা করে না থাকলেও বাসটি সেখান দিয়ে গেলে সেটিকে সরাসরি রুট হিসেবে দেখায় (যেমন উত্তরা থেকে আজিমপুর)। সেখানে ভাড়া আগের ও পরের স্টপেজের ভাড়ার মধ্যে দেখানো হয়।
- সরাসরি রুট না থাকলে একবার বাস বদলে যাওয়ার উপায় দেখায়।
- শিক্ষার্থীর ভাড়া চার্টের ভাড়ার অর্ধেক।
- **সর্বনিম্ন ভাড়া ১০ টাকা, সাধারণ ও শিক্ষার্থী সবার জন্য।** আসল ভাড়া ১০ টাকার কম হলে আসল ভাড়া ও দিতে হবে এমন ভাড়া দুটোই দেখায়। যেমন পুরো ভাড়া ১৫ টাকা হলে শিক্ষার্থী দেবেন ১০ টাকা।
- ৭৮টি রুটের পুরো ভাড়ার চার্ট, ২৪২টি স্টপেজ।

## বাসের নাম যোগ করা

ভাড়ার চার্টে বাস কোম্পানির নাম ছাপা নেই। কোন রুটে কোন বাস চলে তা `source/data/buses.txt` ফাইলে লিখলে অ্যাপে দেখাবে এবং নাম দিয়ে খোঁজা যাবে:

```
এ-৩৫৬ | বাসের নাম, আরেকটি নাম | Bus name, Another name
```

## তথ্যের উৎস

ঢাকা মেট্রো যাত্রী ও পণ্য পরিবহন কমিটির ডিজেলচালিত বাস ভাড়ার চার্ট (প্রজ্ঞাপন: ০৭ আশ্বিন ১৪৩৩ / ২২ সেপ্টেম্বর ২০২৬), প্রতি কিলোমিটার ২.৭০ টাকা। চার্টের ছবি থেকে প্রতিটি ঘর পড়ে `source/data/` ফোল্ডারে লেখা হয়েছে এবং `verify.py` দিয়ে কিলোমিটারের হিসাবের সাথে মিলিয়ে দেখা হয়েছে।

## English

A web app for looking up Dhaka bus fares from the official fare charts, in Bangla and English: direct routes, one-change journeys, student half fare, and a 10 taka minimum fare for everyone. It is a single static page (`index.html`) with no server.

Files under `source/`:

- `data/b*.txt` – the fare charts, transcribed cell by cell; `verify.py` checks them against the per-kilometre rate.
- `data/names_en.txt` – English names of stops; `data/buses.txt` – bus names per route (fill in by hand).
- `infer.py` – finds stops a route passes without a row of its own on that route's chart.
- `app/app.tpl.html` – the page; `build_data.py` and `build.py` put the data into it.

To rebuild after editing the data:

```
cd source
python3 verify.py
python3 build_data.py
python3 build.py        # writes source/dist/index.html; copy it to the repository root
```
