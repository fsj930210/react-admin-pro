import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@rap/i18n";
import { toast } from "sonner";
import type { ILoginRequestData } from "@/service/auth";
import { login, logout } from "@/service/auth";

export function useAuth() {
  const navigate = useNavigate();
  const { t } = useTranslation("webApp");

  const loginMutation = useMutation({
    mutationFn: async (credentials: ILoginRequestData) => {
      const { data } = await login(credentials);
      return data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        toast.success(t("auth.loginSuccess"));
        navigate({ to: "/dashboard", replace: true });
      }
    },
    onError: () => {
      toast.error(t("auth.loginFailed"));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await logout();
      return res;
    },
    onSuccess: () => {
      localStorage.removeItem("token");
      toast.success(t("auth.logoutSuccess"));
      navigate({ to: "/login", replace: true });
    },
    onError: () => {
      toast.error(t("auth.logoutFailed"));
    },
  });

  return {
    loginMutation,
    logoutMutation,
  };
}
