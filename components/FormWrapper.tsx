import type { ReactNode } from "react";

const BUILDING_IMAGE_URL =
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800";

type FormWrapperProps = {
  children: ReactNode;
  header?: ReactNode;
};

export function FormWrapper({ children, header }: FormWrapperProps) {
  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <aside className="relative hidden md:block md:w-[40%] lg:w-[40%]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BUILDING_IMAGE_URL})` }}
          role="img"
          aria-label="London Academy building"
        />
        <div className="absolute inset-0 bg-[#0a2342]/80" />
        <div className="relative flex h-full min-h-screen flex-col justify-center px-10 text-white lg:px-16">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/80">
            London Academy
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-widest lg:text-4xl">
            LONDON ACADEMY
          </h1>
          <p className="mt-4 text-xl font-medium text-white/95">
            Formulaire d&apos;inscription
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
            Rejoignez notre communauté d&apos;excellence
          </p>
        </div>
      </aside>

      <div className="flex w-full flex-col justify-center px-4 py-8 sm:px-6 md:w-[60%] md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-xl space-y-6">
          {header}
          <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8 md:p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
