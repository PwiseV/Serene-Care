import dbConnect from "@/lib/mongoose";
import HealthRecord from "@/models/HealthRecord";
import { deleteByPublicId, uploadBuffer, UploadResult } from "@/lib/cloudinary";

export interface HealthRecordItem {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function getRecords(patientId: string): Promise<HealthRecordItem[]> {
  await dbConnect();
  const docs = await HealthRecord.find({ patientId })
    .sort({ uploadedAt: -1 })
    .lean();
  return docs.map((r) => ({
    id: r._id.toString(),
    title: r.title,
    fileUrl: r.fileUrl,
    fileType: r.fileType,
    fileSize: r.fileSize,
    uploadedAt: r.uploadedAt.toISOString(),
  }));
}

export async function createRecord(
  patientId: string,
  title: string,
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  fileSize: number
): Promise<HealthRecordItem> {
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 5 MB limit");
  }

  await dbConnect();

  const upload: UploadResult = await uploadBuffer(fileBuffer, originalName, mimeType);

  const record = await HealthRecord.create({
    patientId,
    title: title.trim(),
    fileUrl: upload.url,
    filePublicId: upload.publicId,
    fileType: mimeType,
    fileSize: upload.fileSize,
  });

  return {
    id: record._id.toString(),
    title: record.title,
    fileUrl: record.fileUrl,
    fileType: record.fileType,
    fileSize: record.fileSize,
    uploadedAt: record.uploadedAt.toISOString(),
  };
}

export async function deleteRecord(patientId: string, recordId: string): Promise<void> {
  await dbConnect();

  const record = await HealthRecord.findById(recordId);
  if (!record) throw new Error("Record not found");
  if (record.patientId.toString() !== patientId) throw new Error("Forbidden");

  // Remove from Cloudinary first; if it fails the DB record is still kept (no orphan URL)
  await deleteByPublicId(record.filePublicId).catch(console.error);
  await record.deleteOne();
}
