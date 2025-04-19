import { Link } from "react-router";
import { X, Facebook, Linkedin } from "lucide-react";

/**
 * フッターセクション
 */
export function FooterSection() {
  return (
    <footer className="w-full py-6 md:py-12 border-t">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              © 2025 LYNX. All rights reserved.
            </p>
          </div>
          
          {/* ソーシャルリンク */}
          <div className="flex space-x-4">
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">X (Twitter)</span>
              <X className="h-5 w-5" />
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-5 w-5" />
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
          
          {/* フッターリンク */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <Link to="#" className="hover:underline">
              プライバシーポリシー
            </Link>
            <Link to="#" className="hover:underline">
              利用規約
            </Link>
            <Link to="#" className="hover:underline">
              お問い合わせ
            </Link>
            <Link to="#" className="hover:underline">
              会社概要
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
