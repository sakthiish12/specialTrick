"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MessageSquare, Send, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Comment {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (comment: { name: string; email?: string; content: string; parentId?: string }) => Promise<void>;
  className?: string;
}

export function CommentSection({ comments, onAddComment, className }: CommentSectionProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    try {
      setIsSubmitting(true);
      await onAddComment({
        name,
        email,
        content,
      });
      setContent("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!name.trim() || !replyContent.trim()) return;

    try {
      setIsSubmitting(true);
      await onAddComment({
        name,
        email,
        content: replyContent,
        parentId,
      });
      setReplyContent("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium mb-1 block">
                  Name *
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium mb-1 block">
                  Email (optional)
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="comment" className="text-sm font-medium mb-1 block">
                Comment *
              </label>
              <Textarea
                id="comment"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Share your thoughts..."
                rows={4}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Post Comment"}
            </Button>
          </form>

          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-full">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{comment.user_name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs mt-2"
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    >
                      {replyTo === comment.id ? "Cancel" : "Reply"}
                    </Button>

                    {replyTo === comment.id && (
                      <div className="mt-4 pl-4 border-l-2 border-muted-foreground/20">
                        <Textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={`Reply to ${comment.user_name}...`}
                          rows={3}
                          className="mb-2"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={isSubmitting || !replyContent.trim()}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          {isSubmitting ? "Sending..." : "Send Reply"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-6 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-muted/20 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 p-1 rounded-full">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                              <span className="font-medium text-sm">{reply.user_name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          <p className="text-sm">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
