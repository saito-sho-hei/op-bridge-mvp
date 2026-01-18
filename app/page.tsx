import InputForm from "@/components/InputForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 print:min-h-0 print:py-0 print:bg-white">
      <div className="container mx-auto px-4">
        <InputForm />
      </div>

      <footer className="mt-12 text-center text-gray-400 text-sm print:hidden">
        <p>© 2026 OP Bridge MVP</p>
      </footer>
    </main>
  );
}
