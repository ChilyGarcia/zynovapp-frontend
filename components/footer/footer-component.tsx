export default function FooterComponent() {
  return (
    <>
      <footer className="bg-[#F5F3FF] py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <img
                src="/icons/zynovapp-icon.png"
                alt="Zynovapp"
                className="h-6 w-auto"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex justify-center gap-8 mb-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Home
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              About
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Service
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Contact Us
            </a>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-4 mb-6">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/zynovapp/"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-pink-500 to-indigo-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1.5"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
            {/* Facebook */}
            <a
              href="#"
              aria-label="Facebook"
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 1.86 6.48 1.86 12.07c0 5 3.66 9.14 8.44 9.93v-7.02H7.9v-2.91h2.4V9.84c0-2.37 1.41-3.68 3.56-3.68 1.03 0 2.1.18 2.1.18v2.31h-1.18c-1.17 0-1.53.73-1.53 1.48v1.78h2.61l-.42 2.91h-2.19V22c4.78-.79 8.44-4.93 8.44-9.93z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="#"
              aria-label="LinkedIn"
              className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 8.98h3.96V21H3V8.98zM9.5 8.98H13v1.64h.05c.49-.93 1.68-1.9 3.47-1.9 3.71 0 4.39 2.44 4.39 5.61V21h-3.96v-4.96c0-1.18-.02-2.7-1.65-2.7-1.66 0-1.92 1.29-1.92 2.62V21H9.5V8.98z" />
              </svg>
            </a>
            {/* X */}
            <a
              href="#"
              aria-label="X"
              className="w-10 h-10 bg-black rounded-full flex items-center justify-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3 3h3.5l5 6.5L17.5 3H21l-7 9 7 9h-3.5l-5-6.5L6.5 21H3l7-9-7-9z" />
              </svg>
            </a>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mb-4"></div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm text-gray-500">Copyright Zynovapp S.A.S</p>
          </div>
        </div>
      </footer>
    </>
  );
}
