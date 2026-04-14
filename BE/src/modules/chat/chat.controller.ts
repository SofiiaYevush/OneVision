import { Response } from 'express';
import { AuthRequest } from '../auth/auth.types';
import * as chatService from './chat.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { z } from 'zod';

const initConvSchema = z.object({
  performerId: z.string().length(24),
});

const sendMsgSchema = z.object({
  content: z.string().min(1).max(5000),
});

const pagingSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const initConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { performerId } = initConvSchema.parse(req.body);
  const conv = await chatService.getOrCreateConversation(req.user.sub, performerId);
  res.json({ status: 'success', data: conv });
});

export const listConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await chatService.listMyConversations(req.user.sub);
  res.json({ status: 'success', data: items });
});

export const getConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const conv = await chatService.getConversation(req.params.id, req.user.sub);
  res.json({ status: 'success', data: conv });
});

export const getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit } = pagingSchema.parse(req.query);
  const result = await chatService.getMessages(req.params.id, req.user.sub, page, limit);
  res.json({ status: 'success', ...result });
});

export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { content } = sendMsgSchema.parse(req.body);
  const msg = await chatService.sendMessage({
    conversationId: req.params.id,
    senderId: req.user.sub,
    content,
  });
  res.status(201).json({ status: 'success', data: msg });
});