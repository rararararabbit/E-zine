import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Article } from "../types";

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        setImageUrl(`https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop`);
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  }, [article.title]);

  return (
    <motion.div
      layoutId={`card-${article.id}`}
      className="group flex flex-col transition-all duration-500 cursor-pointer"
      onClick={() => onClick(article)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="aspect-[16/9] bg-gray-200 mb-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.img
            src={imageUrl || ""}
            alt={article.title}
            className="w-full h-full object-cover transition-all duration-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
        <span className="absolute bottom-2 left-2 z-20 text-[10px] bg-white px-2 py-1 uppercase font-bold tracking-tighter">
          {article.category}
        </span>
      </div>
      
      <div className="flex flex-col flex-1">
        <h3 className="text-2xl font-serif mt-2 mb-3 leading-tight group-hover:underline">
          {article.title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-3 mb-4 font-sans leading-relaxed">
          {article.summary}
        </p>
      </div>
    </motion.div>
  );
};
