import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from "@/shared/ui";
import { useAuthService, LoginFormSchema, type LoginForm } from "@/features/auth";
import { PageContainer } from "@/widgets/page-container";

export function LoginForm() {
  const authService = useAuthService();

  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await authService.auth.login(data);
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "로그인에 실패했습니다.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <PageContainer maxWidth="sm" padding="md" className="w-full">
        <div className="max-w-md mx-auto space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">로그인</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">계수기 시스템에 로그인하세요</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>사용자명</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="사용자명을 입력하세요"
                          autoComplete="username"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="비밀번호를 입력하세요"
                          autoComplete="current-password"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.formState.errors.root && (
                <div className="rounded-md bg-destructive/15 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="group relative w-full flex justify-center py-2 px-4"
                >
                  {form.formState.isSubmitting ? "로그인 중..." : "로그인"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </PageContainer>
    </div>
  );
}
