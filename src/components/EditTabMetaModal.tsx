import React, { useEffect, useRef } from 'react';

interface EditTabMetaModalProps {
  open: boolean;
  titleValue: string;
  noteValue: string;
  setTitleValue: (v: string) => void;
  setNoteValue: (v: string) => void;
  onClear: () => void;
  onClose: () => void;
}

function EditTabMetaModal({
  open,
  titleValue,
  noteValue,
  setTitleValue,
  setNoteValue,
  onClear,
  onClose,
}: EditTabMetaModalProps): React.ReactElement {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const handleClose = () => {
      if (open) onClose();
    };
    if (dialog) dialog.addEventListener('close', handleClose);
    return () => {
      if (dialog) dialog.removeEventListener('close', handleClose);
    };
  }, [open, onClose]);

  return (
    <dialog ref={dialogRef} className='modal'>
      <div className='modal-box w-72'>
        <h3 className='mb-3 text-lg font-bold'>Edit Title & Note</h3>
        <div className='space-y-2'>
          <input
            type='text'
            className='input input-bordered input-sm w-full'
            placeholder='Edit tab title'
            maxLength={200}
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
          />
          <textarea
            className='textarea textarea-bordered textarea-sm w-full'
            placeholder='Add a note (optional)'
            maxLength={300}
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
          />
        </div>
        <div className='modal-action'>
          <button type='button' className='btn btn-ghost' onClick={onClear}>
            Clear
          </button>
          <button type='button' className='btn btn-primary' onClick={onClose}>
            Done
          </button>
        </div>
      </div>
      <form method='dialog' className='modal-backdrop'>
        <button type='submit' aria-label='Close'>
          close
        </button>
      </form>
    </dialog>
  );
}

export default EditTabMetaModal;
