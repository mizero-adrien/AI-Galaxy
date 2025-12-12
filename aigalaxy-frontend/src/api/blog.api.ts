import { apiClient } from "../utils/apiClient";

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  author: {
    id: number;
    username: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  cover_image?: string;
  image?: string;
  is_published: boolean;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  tools_mentioned?: Array<{
    id: number;
    name: string;
    description: string;
    image?: string;
    link?: string;
    is_premium: boolean;
    is_free: boolean;
  }>;
}

export interface BlogComment {
  id: number;
  author: {
    id: number;
    username: string;
    email: string;
  };
  body: string;
  content?: string; // For backward compatibility
  user?: { // For backward compatibility
    id: number;
    username: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  parent?: number | null;
  active?: boolean;
  replies?: BlogComment[];
  reply_count?: number;
  is_reply?: boolean;
}

export interface BlogPostList {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  author: {
    id: number;
    username: string;
    email: string;
  };
  created_at: string;
  cover_image?: string;
  image?: string;
  is_published: boolean;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
}

export const getBlogPosts = async (featured?: boolean): Promise<BlogPostList[]> => {
  const params = featured ? { featured: 'true' } : {};
  const response = await apiClient.get<{count: number, next: string | null, previous: string | null, results: BlogPostList[]}>("/api/blog/", { params });
  // Handle paginated response - extract results array
  if (response.data && 'results' in response.data) {
    return response.data.results;
  }
  // Fallback for non-paginated response
  return Array.isArray(response.data) ? response.data : [];
};

export const getPopularBlogPosts = async (limit: number = 5): Promise<BlogPostList[]> => {
  // Get featured posts or posts sorted by likes/views
  const response = await apiClient.get<{count: number, next: string | null, previous: string | null, results: BlogPostList[]}>("/api/blog/", { 
    params: { featured: 'true', page_size: limit } 
  });
  // Handle paginated response - extract results array
  if (response.data && 'results' in response.data) {
    return response.data.results.slice(0, limit);
  }
  // Fallback for non-paginated response
  const posts = Array.isArray(response.data) ? response.data : [];
  return posts.slice(0, limit);
};

export const getBlogPost = async (slug: string): Promise<BlogPost> => {
  const response = await apiClient.get<BlogPost>(`/api/blog/${slug}/`);
  return response.data;
};

export const createBlogPost = async (data: {
  title: string;
  content: string;
  excerpt?: string;
  image?: File;
  is_published?: boolean;
}): Promise<BlogPost> => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("content", data.content);
  if (data.excerpt) formData.append("excerpt", data.excerpt);
  if (data.image) formData.append("image", data.image);
  if (data.is_published !== undefined) formData.append("is_published", String(data.is_published));

  const response = await apiClient.post<BlogPost>("/api/blog/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const toggleLike = async (slug: string, userEmail?: string): Promise<{ message: string; is_liked: boolean; like_count: number }> => {
  const response = await apiClient.post<{ message: string; is_liked: boolean; like_count: number }>(
    `/api/blog/${slug}/toggle_like/`,
    userEmail ? { user_email: userEmail } : {}
  );
  return response.data;
};

export const checkLike = async (slug: string): Promise<{ is_liked: boolean; like_count: number }> => {
  const response = await apiClient.get<{ is_liked: boolean; like_count: number }>(
    `/api/blog/${slug}/check_like/`
  );
  return response.data;
};

export const getPostComments = async (postId: number): Promise<BlogComment[]> => {
  const response = await apiClient.get<{results?: BlogComment[], count?: number} | BlogComment[]>(`/api/comments/?post=${postId}`);
  // Handle paginated response
  if (response.data && typeof response.data === 'object' && 'results' in response.data) {
    return (response.data as {results: BlogComment[]}).results;
  }
  return Array.isArray(response.data) ? response.data : [];
};

export const addComment = async (postId: number, content: string, userEmail?: string): Promise<BlogComment> => {
  const response = await apiClient.post<BlogComment>(`/api/comments/`, { 
    post: postId, 
    body: content,
    user_email: userEmail
  });
  return response.data;
};

export const updateComment = async (commentId: number, content: string): Promise<BlogComment> => {
  const response = await apiClient.patch<BlogComment>(`/api/comments/${commentId}/`, { body: content });
  return response.data;
};

export const deleteComment = async (commentId: number): Promise<void> => {
  await apiClient.delete(`/api/comments/${commentId}/`);
};




