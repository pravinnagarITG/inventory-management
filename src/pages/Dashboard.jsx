import {Page, LegacyCard, DataTable , Text, Spinner, Badge, Card} from '@shopify/polaris';
import { useEffect, useState } from 'react';

export default function Dashboard() {

  // Initialize currentPage from localStorage or default to 1
const [currentPage, setCurrentPage] = useState(() => {
  const savedPage = localStorage.getItem('currentPage');
  return savedPage ? parseInt(savedPage, 10) : 1;
});

const [rows, setRows] = useState([]);
const [loading, setLoading] = useState(true);
const [hasNext, setHasNext] = useState(false);
const itemsPerPage = 50;


useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
      const response = await fetch(`https://inventory-management-mauve-seven.vercel.app/api/orderpage?page=${currentPage}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
      });

      if (!response.ok) {
          throw new Error('Failed to fetch orders. Unauthorized or server error.');
        }

      const data = await response.json();
        const formatted = data.data.map((item) => ({
          _id: item._id,
          order_id: item.order_id,
          productTitle: item.variant_title,
          sku: item.sku || '-',
          quantity: item.quantity || '-',
          store_name:item.store_name,
          date:item.createdAt
        }));
      formatted.reverse();
      setRows(formatted);
      setHasNext(data.hasNext || formatted.length === itemsPerPage);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
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


    // Format rows for DataTable
  const tableRows = rows.map((row, index) => [
    row.order_id,
    row.productTitle,
    row.sku,
    row.quantity,
    row.store_name,
    row.date,
  ]);

  // Calculate item range for display (e.g., 1-50, 51-100)
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, startItem + rows.length - 1);
  const itemRange = `${startItem}-${endItem}`;

  return (
  <>
  <Page fullWidth
      title="All Orders"
    >
    </Page>
     <Page fullWidth>
      <LegacyCard>
       {loading ? (
        <> 
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <Spinner accessibilityLabel="Loading orders" size="large" />
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <Text>Loading Orders...</Text>
            </div>
            </>
          ) :  tableRows.length > 0 ? (
        <DataTable
          columnContentTypes={[ 
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
          ]}
         headings={[
              <Text key="order-id" variant="headingMd" fontWeight="bold" as="h6">
                Order Id
              </Text>,
              <Text key="line-item" variant="headingMd" fontWeight="bold" as="h6">
               Line Item
              </Text>,
              <Text key="sku" variant="headingMd" fontWeight="bold" as="h6">
                SKU
              </Text>,
              <Text key="quantity" variant="headingMd" fontWeight="bold" as="h6">
               Quantity
              </Text>,
              <Text key="store-name" variant="headingMd" fontWeight="bold" as="h6">
                Store Name
              </Text>,
               <Text key="date" variant="headingMd" fontWeight="bold" as="h6">
                Date
              </Text>,
            ]}
            rows={tableRows} 
              pagination={{
                hasNext: hasNext,
                label: tableRows.length >= 50 ? itemRange : "",
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
    </>
  );
}