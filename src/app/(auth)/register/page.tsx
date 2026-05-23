"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const registerSchema = z.object({
  name: z.string().min(2, "Họ và tên quá ngắn"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  confirmPassword: z.string(),
  isDoctor: z.boolean().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: "Bạn phải đồng ý với Điều khoản dịch vụ",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.isDoctor ? "doctor" : "patient",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrorMsg(errorData.error || "Đăng ký thất bại");
      } else {
        // Redirect to login page after successful registration
        router.push("/login?registered=true");
      }
    } catch (error) {
      setErrorMsg("Đã có lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50 px-6 py-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-start">
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        <div className="hidden lg:block lg:col-span-5 relative overflow-hidden bg-primary">
          <img
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUc2RTDUH-03kNXPM0xjaacnfsTDSC2TgsfJQD50Y3MLTfI_b1b6wjsepXJV6ra6Lscec0YyhXOx4ErwBMN1VzKRjKfNr48UsZZ38A1O-IZcpbRVPHnErM_L68aXad2J0_OzCz9gy_Zck3ULIrkcUjJQTo8YB6N11AU8Ahj8xgNavhe5dBV25UTlekiTqmsNuGiNy-OXyTOxOj3ZywBZqXxS81kYYwS9aoln-N7asMWfVIYbINRB88TjpMoEfwuiFKUt2X0rvvLU8"
            alt="Modern minimalist clinic interior"
          />
          <div className="relative h-full flex flex-col justify-end p-16 z-10">
            <h1 className="font-headline text-5xl font-extrabold text-on-primary tracking-tight leading-tight mb-6">
              Không gian số<br />
              cho sức khỏe của bạn.
            </h1>
            <p className="text-lg text-primary-fixed-dim max-w-md font-medium leading-relaxed">
              Tham gia cộng đồng ưu tiên sự an lạc của bạn thông qua dịch vụ
              chăm sóc chuyên nghiệp và trải nghiệm kỹ thuật số yên bình.
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent pointer-events-none"></div>
        </div>

        <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-surface">
          <div className="w-full max-w-xl">
            <div className="mb-10 pt-10">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">
                Tạo tài khoản
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Bắt đầu hành trình chăm sóc sức khỏe toàn diện của bạn. Vui lòng
                điền thông tin bên dưới.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errorMsg && (
                <div className="p-3 bg-error-container text-on-error-container rounded-md text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label
                    className="block text-sm font-semibold text-on-surface mb-2 ml-1"
                    htmlFor="name"
                  >
                    Họ và tên
                  </label>
                  <input
                    {...register("name")}
                    className="w-full px-5 py-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all duration-200 outline-none"
                    id="name"
                    placeholder="Nguyễn Văn A"
                    type="text"
                  />
                  {errors.name && (
                    <span className="text-error text-xs ml-1 block mt-1">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div className="col-span-full md:col-span-1">
                  <label
                    className="block text-sm font-semibold text-on-surface mb-2 ml-1"
                    htmlFor="email"
                  >
                    Địa chỉ Email
                  </label>
                  <input
                    {...register("email")}
                    className="w-full px-5 py-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all duration-200 outline-none"
                    id="email"
                    placeholder="email@example.com"
                    type="email"
                  />
                  {errors.email && (
                    <span className="text-error text-xs ml-1 block mt-1">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="col-span-full md:col-span-1">
                  <label
                    className="block text-sm font-semibold text-on-surface mb-2 ml-1"
                    htmlFor="phone"
                  >
                    Số điện thoại
                  </label>
                  <input
                    {...register("phone")}
                    className="w-full px-5 py-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all duration-200 outline-none"
                    id="phone"
                    placeholder="090 000 0000"
                    type="tel"
                  />
                </div>

                <div className="col-span-full md:col-span-1 relative">
                  <label
                    className="block text-sm font-semibold text-on-surface mb-2 ml-1"
                    htmlFor="password"
                  >
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      {...register("password")}
                      className="w-full px-5 py-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all duration-200 outline-none pr-12"
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors text-sm"
                    >
                      {showPassword ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-error text-xs ml-1 block mt-1">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div className="col-span-full md:col-span-1 relative">
                  <label
                    className="block text-sm font-semibold text-on-surface mb-2 ml-1"
                    htmlFor="confirmPassword"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      {...register("confirmPassword")}
                      className="w-full px-5 py-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all duration-200 outline-none pr-12"
                      id="confirmPassword"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-error text-xs ml-1 block mt-1">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Is Doctor Checkbox */}
              <div className="flex items-start gap-3 py-2 bg-surface-container-low/50 p-4 rounded-lg mt-4 border border-outline-variant/30">
                <div className="flex items-center h-5 mt-1">
                  <input
                    {...register("isDoctor")}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary transition-all cursor-pointer"
                    id="isDoctor"
                    type="checkbox"
                  />
                </div>
                <div className="text-sm">
                  <label
                    className="text-on-surface font-semibold cursor-pointer select-none"
                    htmlFor="isDoctor"
                  >
                    Tôi là tham gia với tư cách Bác sĩ
                  </label>
                  <p className="text-on-surface-variant text-xs mt-1">
                    Đăng ký tài khoản bác sĩ. Lưu ý: Cần được Quản trị viên phê duyệt trước khi bắt đầu nhận lịch trình.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-2">
                <div className="flex items-center h-5">
                  <input
                    {...register("terms")}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary transition-all cursor-pointer"
                    id="terms"
                    type="checkbox"
                  />
                </div>
                <div className="text-sm">
                  <label
                    className="text-on-surface-variant font-medium"
                    htmlFor="terms"
                  >
                    Tôi đồng ý với{" "}
                    <Link
                      className="text-primary font-semibold hover:underline"
                      href="#"
                    >
                      Điều khoản dịch vụ
                    </Link>{" "}
                    và{" "}
                    <Link
                      className="text-primary font-semibold hover:underline"
                      href="#"
                    >
                      Chính sách bảo mật
                    </Link>
                    .
                  </label>
                  {errors.terms && (
                    <span className="text-error text-xs block mt-1">
                      {errors.terms.message}
                    </span>
                  )}
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold rounded-lg shadow-[0px_12px_32px_rgba(57,73,218,0.15)] hover:shadow-[0px_12px_48px_rgba(57,73,218,0.25)] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                type="submit"
              >
                {loading ? "Đang xử lý..." : "Tạo tài khoản"}
              </button>

              <div className="text-center mt-8">
                <p className="text-on-surface-variant text-sm font-medium">
                  Đã có tài khoản?
                  <Link
                    className="text-primary font-bold ml-1 hover:underline active:scale-95 transition-all"
                    href="/login"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
