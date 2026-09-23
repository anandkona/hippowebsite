import { Pool } from 'pg';

const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/hippocloudwebsite' });

const updateQuery = `
  UPDATE products
  SET 
    product_id = 'hippomint',
    name = 'Hippomint',
    tagline = 'Smart GST Billing and Inventory App',
    description = 'Streamline your business operations with our comprehensive GST billing and inventory management solution.',
    image_url = 'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/36433cb3-8d2f-44cf-b9a5-567e292ed450/id-preview-5b1d5f51--32533aa6-0848-4a2a-b612-4c05966cf729.lovable.app-1775153420430.png',
    page_content = jsonb_set(
      jsonb_set(
        jsonb_set(
          page_content, 
          '{heroTitles}', 
          '["Smart GST Billing and Inventory App"]'::jsonb
        ),
        '{heroSubtitles}',
        '["Comprehensive GST billing, inventory management, and business operations platform."]'::jsonb
      ),
      '{heroImages}',
      '["https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/36433cb3-8d2f-44cf-b9a5-567e292ed450/id-preview-5b1d5f51--32533aa6-0848-4a2a-b612-4c05966cf729.lovable.app-1775153420430.png"]'::jsonb
    )
  WHERE product_id = 'aaaa' OR product_id = 'hippomint';
`;

pool.query(updateQuery)
  .then(res => {
    console.log(`Updated ${res.rowCount} rows`);
    pool.end();
  })
  .catch(err => {
    console.error(err);
    pool.end();
  });
