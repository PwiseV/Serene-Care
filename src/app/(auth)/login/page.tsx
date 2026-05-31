"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        setErrorMsg("Email hoặc mật khẩu không chính xác");
      } else {
        const params = new URLSearchParams(window.location.search);
        const callbackUrl = params.get("callbackUrl");
        router.push(callbackUrl ?? "/dashboard");
        router.refresh();
      }
    } catch (error) {
      setErrorMsg("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_12px_32px_rgba(27,28,28,0.06)] min-h-[700px]">
          <section className="relative hidden md:block overflow-hidden">
            <img
              alt="Calming healthcare background"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDw5gQM_9bD5cKY_r7hCccSILqIsWWEaMNDm-4zIVoj2V1uFnTKtRqsBCGLitzAwyvhgNvyfKrTxZ61K0W89T4gJzk7D9Znsawx8yg32ufCNY-63sUp6WemnxUqYv1Pn2jYanIWdxw0bPwmsqAqzbMSfG9j6vzWmChRfetpkWSc71t_anWI7kCUvfuRCI1hfTOuPMzYqaJET34c2d_m1RyKJpIsTYg_kBGm2Eyei01gfZw23C-u_trK7koxy6axcujP0WewiRy9r0"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent flex flex-col justify-end p-12">
              <div className="bg-white/70 backdrop-blur-md p-8 rounded-lg max-w-sm">
                <h2 className="font-headline text-3xl font-bold text-primary mb-4 tracking-tight">
                  Serene Care
                </h2>
                <p className="text-on-surface-variant font-medium leading-relaxed">
                  Trải nghiệm sự xuất sắc về lâm sàng trong một không gian kỹ
                  thuật số yên bình. Hành trình hồi phục của bạn bắt đầu bằng
                  sự rõ ràng và an tâm.
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col p-8 md:p-16 lg:p-20 justify-center">
            <div className="max-w-md mx-auto w-full">
              <header className="mb-10">
                <h1 className="font-headline text-4xl font-extrabold text-on-surface mb-2 tracking-tight">
                  Chào mừng trở lại
                </h1>
                <p className="text-on-surface-variant">
                  Vui lòng nhập thông tin để đăng nhập
                </p>
              </header>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {errorMsg && (
                  <div className="p-3 bg-error-container text-on-error-container rounded-md text-sm font-medium">
                    {errorMsg}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label
                    className="block font-label text-sm font-semibold text-on-surface-variant ml-1"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    {...register("email")}
                    className="w-full bg-surface-container-low border-none rounded-md px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all outline-none"
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                  />
                  {errors.email && (
                    <span className="text-error text-xs ml-1">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    className="block font-label text-sm font-semibold text-on-surface-variant ml-1"
                    htmlFor="password"
                  >
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      {...register("password")}
                      className="w-full bg-surface-container-low border-none rounded-md px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all outline-none pr-12"
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors text-sm"
                    >
                      {showPassword ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-error text-xs ml-1">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      {...register("remember")}
                      className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low transition-all"
                      type="checkbox"
                    />
                    <span className="ml-2.5 text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                      Ghi nhớ đăng nhập
                    </span>
                  </label>
                  <Link
                    className="text-sm font-semibold text-primary hover:text-primary-container transition-colors"
                    href="#"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <button
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold py-4 rounded-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100"
                  type="submit"
                >
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
              </form>

              <footer className="mt-12 text-center">
                <p className="text-on-surface-variant font-medium">
                  Chưa có tài khoản?
                  <Link
                    className="text-primary font-bold hover:underline ml-1"
                    href="/register"
                  >
                    Tạo tài khoản mới
                  </Link>
                </p>
              </footer>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
