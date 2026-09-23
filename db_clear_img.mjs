import { Pool } from 'pg';

const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/hippocloudwebsite' });

const updateQuery = `
  UPDATE products
  SET 
    image_url = '',
    page_content = jsonb_set(
      page_content, 
      '{heroImages}', 
      '[]'::jsonb
    )
  WHERE product_id = 'hippomint';
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
