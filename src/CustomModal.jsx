import { Modal, Text } from '@shopify/polaris';

const CustomModal = ({ open, onClose, onAction, title, buttonText, children }) => {

  return (
    <>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Modal
              activator={open}
              open={open}
              onClose={onClose}
              title={title}
              primaryAction={{
                content: buttonText,
                onAction: onAction ? onAction : onClose,
                destructive: true,
              }}
              secondaryActions={[
                {
                  content: 'Cancel',
                  onAction: onClose,
                },
              ]}
            >
              <Modal.Section>
                <div className="modal-content">
                  <Text variant="headingMd" as="h6">
                   {children}
                  </Text>
                </div>
              </Modal.Section>
            </Modal>
        </div>
    </>
  );
};

export default CustomModal;
