import { Link } from 'react-router-dom';
import { Container } from '@/ui';

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-100/80 text-stone-500 hover:bg-stone-200 hover:text-stone-700 transition-all duration-300"
      aria-label={label}
    >
      {children}
    </a>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/90 backdrop-blur-sm border-t border-stone-200/80 mt-auto">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:gap-12 gap-10">
            {/* Brand Section */}
            <div className="space-y-6">
              <div>
                <Link
                  to="/"
                  className="font-serif text-2xl font-medium text-stone-900 tracking-tight transition-colors duration-300 hover:text-stone-700"
                >
                  Lunaz
                </Link>
                <p className="mt-4 text-sm text-stone-500 leading-relaxed max-w-xs">
                  Curated lifestyle and home décor for modern living. Discover pieces that bring
                  sophistication and warmth to your space.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <SocialIcon href="https://www.facebook.com/CandleistabyAfrin" label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://www.instagram.com/lunaz_decor" label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://www.threads.com/@lunaz_decor" label="Threads">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.17.408-2.133 1.332-2.727.851-.539 1.987-.812 3.381-.812.476 0 .964.025 1.459.076-.082-.62-.278-1.126-.586-1.508-.41-.507-1.022-.763-1.82-.763h-.043c-.903.02-1.627.386-2.073.886l-1.447-1.342c.782-.88 1.95-1.382 3.463-1.424h.065c1.344 0 2.444.417 3.273 1.24.715.71 1.166 1.678 1.342 2.87.592.163 1.14.391 1.638.685 1.13.665 1.994 1.587 2.49 2.726.738 1.7.783 4.523-1.478 6.734-1.893 1.853-4.238 2.637-7.385 2.66zm-.09-5.918c.056 0 .112 0 .168-.002 1.056-.057 1.86-.467 2.382-1.218.378-.543.614-1.251.71-2.123-.39-.088-.798-.133-1.221-.133-.956 0-1.722.183-2.216.53-.435.305-.644.7-.622 1.174.033.676.704 1.772 2.8 1.772z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="mailto:hello@lunaz.store" label="Email">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </SocialIcon>
              </div>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-2 gap-8 md:gap-10 xl:col-span-2">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 tracking-wide">Shop</h3>
                  <ul className="mt-5 space-y-4">
                    {[
                      { to: '/products', label: 'All Products' },
                      { to: '/categories', label: 'Categories' },
                      { to: '/products?sort=newest', label: 'New Arrivals' },
                      { to: '/products?featured=true', label: 'Featured' },
                    ].map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className="text-sm text-stone-500 hover:text-stone-900 transition-colors duration-300"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 tracking-wide">Account</h3>
                  <ul className="mt-5 space-y-4">
                    {[
                      { to: '/account', label: 'My Account' },
                      { to: '/account/orders', label: 'Order History' },
                      { to: '/account/addresses', label: 'Addresses' },
                      { to: '/cart', label: 'Shopping Cart' },
                    ].map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className="text-sm text-stone-500 hover:text-stone-900 transition-colors duration-300"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 tracking-wide">Support</h3>
                  <ul className="mt-5 space-y-4">
                    <li>
                      <a
                        href="mailto:hello@lunaz.store"
                        className="text-sm text-stone-500 hover:text-stone-900 transition-colors duration-300"
                      >
                        Contact Us
                      </a>
                    </li>
                    {[
                      { to: '/shipping', label: 'Shipping Info' },
                      { to: '/returns', label: 'Returns & Exchanges' },
                      { to: '/faq', label: 'FAQ' },
                    ].map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className="text-sm text-stone-500 hover:text-stone-900 transition-colors duration-300"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 tracking-wide">Legal</h3>
                  <ul className="mt-5 space-y-4">
                    {[
                      { to: '/privacy', label: 'Privacy Policy' },
                      { to: '/terms', label: 'Terms of Service' },
                    ].map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className="text-sm text-stone-500 hover:text-stone-900 transition-colors duration-300"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-stone-200/80" />

        <div className="py-6 md:py-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-stone-500">© {currentYear} Lunaz. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-stone-400">
              <svg className="w-8 h-5" viewBox="0 0 38 24" fill="currentColor">
                <path
                  d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                  fillOpacity="0.07"
                />
                <path
                  d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                  fill="#fff"
                />
                <path
                  d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1.2-.4 2.1-.7 3.2-.3 1.5-.6 3-1 4.5 0 .2-.1.2-.3.2l-1.7.1zM5 8.2c0-.1.2-.2.3-.2h3.4c.5 0 .9.3 1 .8l.9 4.4c0 .1 0 .1.1.2 0-.1.1-.1.1-.1l2.1-5.1c-.1-.1 0-.2.1-.2h2.1c0 .1 0 .1-.1.2l-3.1 7.3c-.1.2-.1.3-.2.4-.1.1-.3 0-.5 0H9.7c-.1 0-.2 0-.2-.2L7.9 9.5c-.2-.2-.5-.5-.9-.6-.6-.3-1.7-.5-1.9-.5L5 8.2z"
                  fill="#142688"
                />
              </svg>
              <svg className="w-8 h-5" viewBox="0 0 38 24" fill="currentColor">
                <path
                  d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                  fillOpacity="0.07"
                />
                <path
                  d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                  fill="#fff"
                />
                <circle cx="15" cy="12" r="7" fill="#EB001B" />
                <circle cx="23" cy="12" r="7" fill="#F79E1B" />
                <path
                  d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"
                  fill="#FF5F00"
                />
              </svg>
              <svg className="w-8 h-5" viewBox="0 0 38 24" fill="currentColor">
                <path
                  d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                  fillOpacity="0.07"
                />
                <path
                  d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                  fill="#fff"
                />
                <path
                  d="M8.971 10.268l.774-1.876a.581.581 0 011.078 0l.774 1.876.774-1.876a.581.581 0 011.078 0l1.339 3.237a.387.387 0 01-.36.531h-.87a.387.387 0 01-.36-.245l-.465-1.13-.774 1.876a.581.581 0 01-1.078 0l-.774-1.876-.464 1.13a.387.387 0 01-.36.245h-.87a.387.387 0 01-.36-.531l1.338-3.237a.581.581 0 011.078 0l.774 1.876z"
                  fill="#000"
                />
                <path
                  d="M28.5 12.036c0 .87-.266 1.565-.798 2.082-.532.518-1.278.777-2.238.777-.96 0-1.706-.259-2.238-.777-.532-.517-.798-1.211-.798-2.082 0-.87.266-1.565.798-2.082.532-.518 1.278-.777 2.238-.777.96 0 1.706.259 2.238.777.532.517.798 1.211.798 2.082zm-1.664 0c0-.507-.12-.906-.36-1.198-.24-.291-.576-.437-1.012-.437-.435 0-.772.146-1.012.437-.24.292-.36.691-.36 1.198 0 .507.12.906.36 1.198.24.291.577.437 1.012.437.436 0 .773-.146 1.012-.437.24-.292.36-.691.36-1.198z"
                  fill="#000"
                />
              </svg>
            </div>
            <p className="text-xs text-stone-400">Secure payments</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
