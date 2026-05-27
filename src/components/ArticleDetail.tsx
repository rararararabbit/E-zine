import React from "react";
import { motion } from "motion/react";
import { X, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Article } from "../types";

interface ArticleDetailProps {
  article: Article;
  onClose: () => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onClose }) => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchImage = async () => {
      const specialImages: Record<string, string> = {
        "走近数据主架樊进忠": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/6093ae84-6ef4-49cd-8c87-77127be2e94c/6a147fdadb7f3b6fa93048d2.jpg",
        "BIP数据库对象命名规范": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/3c93d163-4af2-44c0-9b94-1df310270810/6a1501fb334b62047b41075f.jpg",
        "数据库对象命名规范": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/3c93d163-4af2-44c0-9b94-1df310270810/6a1501fb334b62047b41075f.jpg",
        "BIP安全编码的输入管理": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/f48bab63-2ce2-488a-9bf3-cd54eccaeca0/6a1502ff2a73ae69c3428e60.jpg",
        "BIP安全编码规范": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/f48bab63-2ce2-488a-9bf3-cd54eccaeca0/6a1502ff2a73ae69c3428e60.jpg",
        "BIP业务对象是什么？": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/96c213ce-4b48-40c9-a7d8-30d194f7e320/6a1508220e5d091d07c01290.jpg",
        "业务对象是什么？": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/96c213ce-4b48-40c9-a7d8-30d194f7e320/6a1508220e5d091d07c01290.jpg",
        "（转载）Harness Engineering，AI时代的新软件工程": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/520991c5-43ab-4bea-a4d8-5f6f1db61202/6a150b0e2a73ae69c342bd19.jpg",
        "Claude Code拥有50多个命令。大多数开发者只用到5个": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/1c39ab6c-5673-42cc-9636-7be60afcffd4/6a150b18334b62047b413a4c.jpg",
        "不用RAG！卡帕西的LLM Wiki方案就很香": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/16050066-9b71-4935-9656-82d77f4143d8/6a150b21db7f3b6fa93106f9.jpg",
        "三顾茅庐—YonClaw篇": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/7aa343a5-736e-4823-973e-0c51f5374ec5/6a14765d9ffd6c4c7ac59301.jpg",
        "致读者·创刊号卷首语": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/5eab00d8-e15c-49b0-86fd-2be7b0173d7e/6a1510d45c33bd08b16f2f6e.jpg",
        "BIP基础硬件环境要求": "https://c2.yonyoucloud.com/yonbip-ec-link/iuap_file/yonbip-ec-minor/qyic8c7o/d55a3c83-42d1-4fe1-992d-7eed9c26516e/6a0ff918e0d4df62e745dac7.jpg"
      };

      if (specialImages[article.title]) {
        setImageUrl(specialImages[article.title]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/generate-image-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: article.title }),
        });
        const data = await response.json();
        setImageUrl(data.imageUrl);
      } catch (error) {
        console.error("Failed to fetch image", error);
        setImageUrl(`https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop`);
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  }, [article.title]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-paper overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 relative">
        <button
          onClick={onClose}
          className="fixed top-6 left-6 md:left-20 flex items-center gap-2 text-sm uppercase tracking-widest font-mono text-gray-400 hover:text-ink transition-colors z-[60]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>返回目录</span>
        </button>

        <motion.div
          layoutId={`card-${article.id}`}
          className="space-y-8"
        >
          <div className="space-y-4 pt-12">
            <span className="text-editorial-label text-xs font-bold uppercase tracking-[0.2em]">
              {article.module} / {article.category}
            </span>
            <h1 className="text-5xl md:text-7xl leading-[1] italic font-light tracking-tighter lining-nums">
              {article.title}
            </h1>
          </div>

          <div className="aspect-[16/9] bg-gray-100 overflow-hidden border border-ink/10 relative">
             {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-ink border-t-transparent rounded-full animate-spin"></div>
                </div>
             ) : (
               <img 
                 src={imageUrl || ""} 
                 alt={article.title}
                 className="w-full h-full object-cover animate-fade-in"
               />
             )}
          </div>

          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>

          <div className="pt-20 border-t border-ink/10">
             <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
               <span>BIP 技术与产品中心 · 总体设计部</span>
               <span>May 2026 — Issue 05</span>
             </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
