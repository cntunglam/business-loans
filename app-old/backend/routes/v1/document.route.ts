import { UserRoleEnum } from '@roshi/shared';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  FileRequest,
  deleteDocument,
  getDocument,
  updateDocument,
  uploadDocument,
} from '../../controllers/v1/document.controller';
import { verifyAuth } from '../../utils/verifyAuth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
});

export const documentRouter = Router();

documentRouter.post('/upload', verifyAuth(), upload.single('file'), (req, res) =>
  uploadDocument(req as FileRequest, res),
);

documentRouter.get('/:filename', verifyAuth(), getDocument);
documentRouter.delete('/:filename', verifyAuth(), deleteDocument);
documentRouter.put('/:filename', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), updateDocument);
