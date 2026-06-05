import { Button } from "@rap/components-ui/button";
import { Checkbox } from "@rap/components-ui/checkbox";
import { FieldGroup, FieldLabel } from "@rap/components-ui/field";
import { Form, FormField } from "@rap/components-ui/form";
import { Input } from "@rap/components-ui/input";
import { useTranslation } from "@rap/i18n";
import { cn } from "@rap/utils";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useAuth } from "../../-hooks/useAuth";
import { QuickLogForm } from "../quick-login";

type LoginFormProps = React.ComponentPropsWithoutRef<"form"> & {
  className?: string;
  quickLoginStyle?: "inline" | "block";
};
export function LoginForm({ className, quickLoginStyle = "inline" }: LoginFormProps) {
  const { t } = useTranslation("webApp");
  const { loginMutation } = useAuth();
  const schema = z.object({
    username: z.string().min(2, {
      message: t("auth.usernameMin"),
    }),
    password: z.string().min(6, {
      message: t("auth.passwordMin"),
    }),
    remember: z.boolean(),
  });
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
    validators: {
      onChange: schema,
      onSubmit: schema,
    },
    onSubmit: ({ value }) => {
      loginMutation.mutate(value);
    },
  });

  return (
    <Form
      form={form}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className={cn("space-y-4", className)}
    >
      <FieldGroup>
        <FormField
          name="username"
          render={({ field, isInvalid }) => (
            <>
              <FieldLabel htmlFor="username">{t("auth.username")}</FieldLabel>
              <Input
                placeholder={t("auth.usernamePlaceholder")}
                id="username"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
              />
            </>
          )}
        />
        <FormField
          name="password"
          render={({ field, isInvalid }) => (
            <>
              <FieldLabel htmlFor="password">{t("auth.password")}</FieldLabel>
              <Input
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                id="password"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
              />
            </>
          )}
        />
      </FieldGroup>

      <div className="flex items-center">
        <FormField
          name="remember"
          fieldProps={{
            className: "w-auto",
          }}
          render={({ field }) => (
            <div className="flex items-center! space-x-1">
              <Checkbox
                id="remember"
                name={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked === true)}
              />
              <FieldLabel>{t("auth.rememberMe")}</FieldLabel>
            </div>
          )}
        />
        <a href="#id" className="ml-auto text-sm underline-offset-4 hover:underline">
          {t("auth.forgotPassword")}
        </a>
      </div>
      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? t("auth.loggingIn") : t("auth.submit")}
      </Button>
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          {t("auth.or")}
        </span>
      </div>
      <QuickLogForm block={quickLoginStyle === "block"} />
      <section className="text-center text-sm">
        {t("auth.noAccount")}{" "}
        <a href="#1" className="underline underline-offset-4">
          {t("auth.signUp")}
        </a>
      </section>
      <section className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        {t("auth.agreementPrefix")} <a href="#1">{t("auth.terms")}</a> {t("auth.agreementAnd")}{" "}
        <a href="#1">{t("auth.privacy")}</a>.
      </section>
    </Form>
  );
}
