import type { ReactNode } from "react";

type FormWrapperProps = {
  children: ReactNode;
  header?: ReactNode;
};

export function FormWrapper({ children, header }: FormWrapperProps) {
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="flex w-full flex-col justify-center px-4 py-8 sm:px-6 md:px-10 lg:px-16">
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
