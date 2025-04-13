import { FcGoogle } from "react-icons/fc";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ThemeProvider } from "~/components/ui/theme-provider";

export default function Login() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
        
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">LYNX</h1>
            <p className="text-sm text-muted-foreground">サイト管理をもっと効率的に</p>
          </div>

          <Card className="border-2 border-muted">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">ログイン</CardTitle>
              <CardDescription className="text-center">
                Googleアカウントでログインして始めましょう
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <a href="http://localhost:3000/auth/google" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 flex items-center justify-center gap-2 h-12 transition-all duration-300 hover:shadow-md"
                >
                  <FcGoogle className="h-5 w-5" />
                  <span>Googleでサインイン</span>
                </Button>
              </a>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
              <p>
                ログインすることで、利用規約とプライバシーポリシーに同意したことになります。
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  );
}
