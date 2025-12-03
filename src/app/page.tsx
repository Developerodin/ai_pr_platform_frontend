// src/app/page.tsx

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="p-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold">Welcome to Our Landing Page</h1>
        <nav>
          <ul className="flex space-x-4 mt-2 text-sm text-gray-600">
            <li><a href="#features" className="hover:underline">Features</a></li>
            <li><a href="#pricing" className="hover:underline">Pricing</a></li>
            <li><a href="#contact" className="hover:underline">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main className="p-8">
        <section id="hero" className="mb-12">
          <h2 className="text-4xl font-extrabold mb-4">Your product made simple</h2>
          <p className="text-lg max-w-xl">
            Build amazing things with our platform. Easy to use and designed with scalability in mind.
          </p>
        </section>

        <section id="features" className="mb-12">
          <h3 className="text-2xl font-semibold mb-3">Features</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 max-w-md">
            <li>Fast performance and reliability</li>
            <li>Easy integration with popular tools</li>
            <li>Secure and scalable infrastructure</li>
            <li>Developer-friendly APIs and SDKs</li>
          </ul>
        </section>

        <section id="pricing" className="mb-12">
          <h3 className="text-2xl font-semibold mb-3">Pricing</h3>
          <p className="max-w-md">
            Simple, transparent pricing with plans for everyone. Start for free with no commitment.
          </p>
        </section>

        <section id="contact">
          <h3 className="text-2xl font-semibold mb-3">Contact Us</h3>
          <p>
            For more information, please email <a href="mailto:info@example.com" className="text-blue-600 underline">info@example.com</a>.
          </p>
        </section>
      </main>

      <footer className="text-center p-6 border-t border-gray-200 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Your Company. All rights reserved.
      </footer>
    </div>
  );
}
