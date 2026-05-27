export interface Article {
  id: string;
  module: "架构殿堂" | "AI天空" | "技术茶馆";
  category: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
}

export interface ModuleInfo {
  id: string;
  name: string;
  description: string;
}
