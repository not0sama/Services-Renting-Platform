import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

# NFR-12 Validation Rules
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}
ALLOWED_DOCUMENT_TYPES = {"application/pdf"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024  # 10MB

def validate_and_save_file(file: UploadFile, is_document: bool = False) -> str:
    """
    Validates the uploaded file against NFR-12 rules and saves it locally.
    Returns the file path or URL for accessing the file.
    """
    if file.content_type is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not determine file type."
        )

    # Validate type
    if is_document:
        if file.content_type not in ALLOWED_DOCUMENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF documents are allowed."
            )
        max_size = MAX_DOCUMENT_SIZE_BYTES
    else:
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only JPG and PNG images are allowed."
            )
        max_size = MAX_IMAGE_SIZE_BYTES

    # Determine size by seeking to end
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)  # Reset cursor for reading

    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {max_size // (1024 * 1024)}MB."
        )

    # Prepare upload directory
    upload_dir = getattr(settings, "UPLOAD_DIR", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    # Generate unique filename
    ext = file.filename.split('.')[-1] if file.filename and '.' in file.filename else "bin"
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save the file."
        )

    return f"/{upload_dir}/{unique_filename}"
