
import "./ConfirmDeleteModal.scss";

interface ConfirmDeleteModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal = ({ message, onConfirm, onCancel }: ConfirmDeleteModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal confirm-modal">
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="btn green_btn" onClick={onConfirm}>Ja, ta bort</button>
          <button className="btn cancel_btn" onClick={onCancel}>Avbryt</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
