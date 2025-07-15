import {Page, LegacyCard, DataTable , Text, Spinner, Modal, DropZone, LegacyStack, TextField, Banner, Badge, Card, Thumbnail} from '@shopify/polaris';
import { ExportIcon, ImportIcon } from '@shopify/polaris-icons';
import { useEffect, useState, useCallback } from 'react';

export default function Products() {

  // Initialize currentPage from localStorage or default to 1
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('currentPage');
    return savedPage ? parseInt(savedPage, 10) : 1;
  });

const [originalRows, setOriginalRows] = useState([]);
const [rows, setRows] = useState([]);
const [activeVal, disbVal] = useState(true);
const [syncBtn, syncBtnDisable] = useState(false);
const [loading, setLoading] = useState(true);
const [hasNext, setHasNext] = useState(false);
const itemsPerPage = 50;

const [modalOpen, setModalOpen] = useState(false);
const [modalTitle, setModalTitle] = useState('');
const [files, setFiles] = useState([]);

const [error, setError] = useState(null);
const [success, setSuccess] = useState(null);

const [msg, loadingMsg] = useState('Loading Products...');

  // Handle DropZone file upload
  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    },
    []
  );

  // Open modal with appropriate title
  const openModal = (title) => {
    setModalTitle(title);
    setModalOpen(true);
    setFiles([]);
  };

  // Close modal
  const handleModalClose = () => {
    setModalOpen(false);
    setFiles([]);
  };

  // Handle file upload (e.g., send to backend)
  const handleFileUpload = () => {
    if (files.length > 0) {
       const token = localStorage.getItem('authToken');
      if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      fetch('https://inventory-management-mauve-seven.vercel.app/api/upload-csv', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData 
      })
      .then(response => response.json())
      .then(data => console.log('Upload success:', data))
      .catch(err => console.error('Upload failed:', err));
    }
    handleModalClose();
  };

 // Handle changes to quantity or threshold
  const handleFieldChange = (value, rowIndex, field) => {
    disbVal(false);
    setRows((prevRows) =>
      prevRows.map((row, index) => index === rowIndex ? { ...row, [field]: value,}: row)
    );
  };

useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
      const response = await fetch(`https://inventory-management-mauve-seven.vercel.app/api/syncpage?page=${currentPage}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
      });

      if (!response.ok) {
          throw new Error('Failed to fetch inventory. Unauthorized or server error.');
        }

      const data = await response.json();

        const formatted = data.data.map((item) => ({
          _id: item._id,
          productImage: item.variant_image || item.product_image,
          productTitle: item.variant_title === "Default Title" ? item.product_title : `${item.product_title} - ${item.variant_title}`,
          threshold: item.threshold,
          sku: item.sku || '-',
          quantity: item.quantity || '-',
          price:item.variant_price
        }));

      setRows(formatted);
      setOriginalRows(formatted);
      setHasNext(data.hasNext || formatted.length === itemsPerPage);
       syncBtnDisable(false); 
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      syncBtnDisable(true); 
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [currentPage]);

// Save currentPage to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

// Handle save action to log changed rows
  const handleSave = () => {
     setLoading(true);
    loadingMsg("Save Products...");
    const changedRows = rows
      .map((row, index) => {
        const originalRow = originalRows[index];
        if (
          originalRow &&
          (row.quantity !== originalRow.quantity || row.threshold !== originalRow.threshold)
        ) {
          return {
            sku: row.sku,
            quantity: row.quantity,
            threshold: row.threshold,
          };
        }
        return null;
      })
      .filter((row) => row !== null);

    console.log('Changed rows:', changedRows);

    const token = localStorage.getItem('authToken');
    if (token && changedRows.length > 0) {
    fetch('https://inventory-management-mauve-seven.vercel.app/update/update-inventory', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      body: JSON.stringify(changedRows),
    });
   };
       setTimeout(() => {
        setLoading(false);
      }, 1000);
  };

// file upload
  const uploadedFiles = files.length > 0 && (
    <LegacyStack vertical>
      {files.map((file, index) => (
        <LegacyStack alignment="center" key={index}>
          <div>
            {file.name} <Text>{file.size} bytes</Text>
          </div>
        </LegacyStack>
      ))}
    </LegacyStack>
  );

    // Format rows for DataTable
  const tableRows = rows.map((row, index) => [
  <LegacyStack alignment="center" spacing="tight">
    <Thumbnail
      source={row.productImage}
      size="small"
      alt={row.productTitle}
    />
    <Text variant="bodyMd">{row.productTitle}</Text>
  </LegacyStack>,
    row.sku,
    row.price,
    <TextField
      key={`quantity-${index}`}
      label="Quantity"
      labelHidden
      type="number"
      value={row.quantity}
      onChange={(value) => handleFieldChange(value, index, 'quantity')}
      autoComplete="off"
    />,
    <TextField
      key={`threshold-${index}`}
      label="Threshold"
      labelHidden
      type="number"
      value={row.threshold}
      onChange={(value) => handleFieldChange(value, index, 'threshold')}
      autoComplete="off"
    />
  ]);

  // Calculate item range for display (e.g., 1-50, 51-100)
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, startItem + rows.length - 1);
  const itemRange = `${startItem}-${endItem}`;

  // sync
const syncProducts = async () => {
  setLoading(true);
  loadingMsg("Syncing Products...");
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      syncBtnDisable(true);

      const response = await fetch('https://inventory-management-mauve-seven.vercel.app/api/sync', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });


      if (response.ok) {
        syncBtnDisable(false); 
        setLoading(false);
      }
      if (!response.ok) {
        throw new Error('Failed to sync products.');
      }

      const data = await response.json();
      console.log('Sync API Response:', data);

    } catch (error) {
      console.error('Error syncing products:', error);
    }
  }

// Export CSV file
  const exportFile = async () => {
    try {
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch('https://inventory-management-mauve-seven.vercel.app/export-sync', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export data.');
      }

      const csvData = await response.text();
      // Create a Blob for the CSV data
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('CSV file downloaded successfully!');
    } catch (err) {
      setError(err.message || 'Failed to export CSV file.');
      console.error('Export failed:', err);
    }
  };

  return (
  <>
    {error && (
      <Banner status="critical" title="Error" onDismiss={() => setError(null)}>
        {error}
      </Banner>
    )}
    {success && (
      <Banner status="success" title="Success" tone="success" onDismiss={() => setSuccess(null)}>
        {success}
      </Banner>
    )}
  <Page fullWidth
      title="Inventory Manage"
      actionGroups={[
        {
            title: 'More actions',
            disabled:syncBtn,
            actions: [
            { content: 'Import file', icon: ImportIcon, onAction: () =>  openModal('Import File') },
            { content: 'Export file', icon: ExportIcon, onAction: () =>  exportFile() },
            ],
        },
      ]}
     secondaryActions={[
      {
          content: 'Sync',
          onAction: syncProducts,
          disabled:syncBtn
      },
      ]}
      primaryAction={{
        content: 'Save',
        onAction: handleSave,
        disabled:activeVal
      }}
    >
    </Page>

     <Page fullWidth>
      <LegacyCard>
       {loading ? (
        <> 
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <Spinner accessibilityLabel="Loading inventory" size="large" />
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <Text>{msg}</Text>
            </div>
            </>
          ) :  tableRows.length > 0 ? (
        <DataTable
          columnContentTypes={[ 
            'text',
            'text',
            'numeric',
            'numeric',
            'numeric',
          ]}
         headings={[
              <Text key="product-title" variant="headingMd" fontWeight="bold" as="h6">
                Product Titles
              </Text>,
              <Text key="sku" variant="headingMd" fontWeight="bold" as="h6">
                SKU
              </Text>,
              <Text key="price" variant="headingMd" fontWeight="bold" as="h6">
                Price
              </Text>,
              <Text key="price" variant="headingMd" fontWeight="bold" as="h6">
                Quantity
              </Text>,
              <Text key="quantity" variant="headingMd" fontWeight="bold" as="h6">
                Threshold
              </Text>,
            ]}
          rows={tableRows} 
              pagination={{
                hasNext: hasNext,
                label:tableRows.length >= 50 ? itemRange : "",
                hasPrevious: currentPage > 1,
                onNext: () => setCurrentPage(currentPage + 1),
                onPrevious: () => setCurrentPage(currentPage - 1),
              }}
              />
              ) : (
            <Card>
            <Badge tone="critical">There is a problem. Please try again.</Badge>
            </Card>
           )}
      </LegacyCard>
    </Page>
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        title={modalTitle}
        primaryAction={{
          content: 'Upload',
          onAction: handleFileUpload,
          disabled: files.length === 0,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleModalClose,
          },
        ]}
      >
        <Modal.Section>
          <LegacyStack vertical>
            <DropZone
              accept=".csv,.xlsx,.xls"
              onDrop={handleDropZoneDrop}
              allowMultiple={false}
            >
              <DropZone.FileUpload />
            </DropZone>
            {uploadedFiles}
          </LegacyStack>
        </Modal.Section>
      </Modal>
    </>
  );
}