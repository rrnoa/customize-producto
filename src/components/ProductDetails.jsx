import React from 'react';
import '../css/ProductDetails.css'; // Make sure to create a corresponding CSS file

const ProductDetails = () => {
  return (
    <div className="product-details-container">
      <ul className="product-attributes">
        <li>* 100% Handmade in the USA</li>
        <li><strong>* Materials:</strong> Premium hardwoods (maple, pine, and poplar), acrylic water-based color finishes</li>
        <li><strong>* Minimum size:</strong> 24x24 inches (60x60 cm)</li>
        <li>* Custom sizes available</li>
      </ul>
      <p className="product-description">
      Transform your cherished images into extraordinary pixel art wooden masterpieces with WoodXEL. Our innovative platform combines cutting-edge 3D modeling technology with traditional woodworking craftsmanship to create unique art pieces that elevate any space.
      </p>

      <p className="product-description">
      Each WoodXEL creation begins with your chosen image, which is then meticulously transformed into a detailed 3D model using our proprietary software. This model guides our skilled artisans as they carefully select, cut, and arrange thousands of precision-milled wooden pixels to recreate your image in exquisite detail.
      </p>

      <p className="product-description">
      We use only the finest hardwoods, including maple, pine, and poplar, sourced from sustainable forests, and non-toxic, acrylic water-based color finishes to ensure that your art piece is as durable as it is beautiful. The natural grain and texture of the wood add depth and character to each pixel, making every WoodXEL creation genuinely one-of-a-kind.
      </p>

      <p className="product-description"><strong>Delivery Options:</strong></p>

      <p className="product-description">
      1. Unframed Panels: For large pieces (e.g., 48x48 inches), we send you multiple panels (e.g., four panels of 24x24 inches) for you to install on the wall individually. This option includes removable blocks, one in the center of each panel for easy mounting. After securing the panels, simply replace the blocks for a seamless look. We offer free shipping to anywhere in the United States for this option.
      </p>
      
      <p className="product-description">
      2. Framed Panels: We can frame your piece with one of our basic one or 2-inch wide front frames, available in white, black, or natural maple. This option allows you to match the frame with the one or 2-inch pixel blocks you can also choose. Users pay for the frame and shipping with this option.
      </p>
      <p className="product-description">
      3. Production time is typically 3-4 weeks, depending on the size and complexity of your design.
      </p>
      <p className="product-description">
      4. Each WoodXEL piece is carefully packaged to ensure safe transit. Shipping includes insurance against damage or loss.
      </p>
      <p className="product-description">
      5. For custom sizes, please contact us at order@woodxel.com to discuss your requirements and get a quote for the frame (if needed) and shipping.
      </p>
      <p className="product-description">
      Please note that due to the custom nature of each piece, slight variations in color and wood grain are to be expected and celebrated. These variations are a testament to the unique character and handcrafted quality of your WoodXEL masterpiece.
      </p>
    </div>
  );
};

export default ProductDetails;