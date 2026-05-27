import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Book, Compass, Coffee, Hash, Search, X } from "lucide-react";
import { Article } from "./types";
import { ArticleCard } from "./components/ArticleCard";
import { ArticleDetail } from "./components/ArticleDetail";

const MODULES = [
  { id: "all", name: "全部", subName: "", icon: Compass },
  { id: "架构殿堂", name: "架构殿堂", subName: "内部知识", icon: Book },
  { id: "AI天空", name: "AI天空", subName: "业界知识", icon: Hash },
  { id: "技术茶馆", name: "技术茶馆", subName: "技术文化与研发分享", icon: Coffee },
];

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch articles", err);
        setLoading(false);
      });
  }, []);

  const filteredArticles = useMemo(() => {
    if (selectedModule === "all") return articles;
    return articles.filter((a) => a.module === selectedModule);
  }, [articles, selectedModule]);

  return (
    <div className="min-h-screen pb-20">
      {/* Magazine Header */}
      <header className="sticky top-0 z-40 bg-paper/80 backdrop-blur-md border-b border-ink">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-end justify-between pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Monthly Technical Digital Journal</span>
            <h1 className="text-4xl md:text-5xl font-serif italic font-light tracking-tighter leading-none text-ink lining-nums">
              BIP 技术与架构 (5月刊)
            </h1>
          </div>
          
          <div className="hidden md:flex flex-col items-end">
             <p className="text-sm font-serif italic mb-2">Issue No. 05 — May 2026</p>
             <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 text-right">
               <span>主编：BIP 技术与产品中心 · 总体设计部</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="md:w-56 shrink-0 border-r border-ink/10 pr-6 space-y-12">
            <div className="space-y-6">
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">目录</h2>
              <nav className="flex flex-row md:flex-col overflow-x-auto pb-4 md:pb-0 gap-8 md:gap-6 no-scrollbar">
                {MODULES.map((mod, idx) => (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModule(mod.id)}
                    className={`group flex flex-col items-start gap-1 transition-all duration-300 whitespace-nowrap text-left`}
                  >
                    <span className="text-[10px] text-gray-400 font-mono">0{idx + 1}</span>
                    <div className="flex flex-row items-baseline gap-2 md:flex-col md:items-start md:gap-1">
                      <span className={`text-lg font-serif italic border-b transition-colors ${
                        selectedModule === mod.id
                          ? "border-ink text-ink"
                          : "border-transparent text-gray-400 group-hover:border-ink/30 group-hover:text-ink"
                      }`}>
                        {mod.name}
                      </span>
                      {mod.subName && (
                        <span className="text-[9px] text-gray-400 uppercase tracking-tighter font-sans">
                          {mod.subName}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Subscription Removed as requested */}
          </aside>

          {/* Content Area */}
          <section className="flex-1 space-y-12">
            <div className="flex items-baseline justify-between border-b border-black/5 pb-4">
               <h2 className="text-3xl font-serif">
                {MODULES.find(m => m.id === selectedModule)?.name}
               </h2>
               <span className="text-xs font-mono text-gray-400">
                 {filteredArticles.length} 篇
               </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-96 bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredArticles.map((article) => (
                  <ArticleCard 
                     key={article.id} 
                     article={article} 
                     onClick={setSelectedArticle}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <AnimatePresence>
        {selectedArticle && (
          <ArticleDetail 
            article={selectedArticle} 
            onClose={() => setSelectedArticle(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
            onClick={() => setShowFeedback(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center w-full border-b border-ink/10 pb-4">
                <span className="text-sm font-bold uppercase tracking-widest text-ink">意见反馈</span>
                <button onClick={() => setShowFeedback(false)} className="p-1 hover:bg-black/5 rounded-full text-gray-400 hover:text-ink transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="w-full text-center py-8">
                <p className="text-sm text-gray-600 mb-2">感谢您对《BIP 技术与架构》的关注。</p>
                <p className="text-xs text-gray-400 italic">反馈功能模块正在建设中，敬请期待...</p>
              </div>
              
              <button 
                onClick={() => setShowFeedback(false)}
                className="w-full bg-ink text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-opacity"
              >
                确定
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-20 border-t border-ink/10 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] uppercase tracking-widest">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex flex-col">
              <span className="font-bold">BIP 技术与产品中心 · 总体设计部</span>
              <span className="text-gray-400 mt-1">© 2026 Monthly Journal. All Rights Reserved</span>
            </div>
          </div>
          
          <div className="flex gap-8 font-bold">
            <button 
              onClick={() => setShowFeedback(true)}
              className="hover:underline cursor-pointer uppercase tracking-widest"
            >
              意见反馈
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
