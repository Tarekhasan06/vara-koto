import Link from 'next/link';

export default function NotFound() {
  return (
    <section>
      <h2>এই পাতাটি পাওয়া যায়নি। / This page was not found.</h2>
      <p className="sub"><Link href="/bn">ভাড়া খোঁজার পাতা</Link> <Link href="/en">Fare finder</Link></p>
    </section>
  );
}
