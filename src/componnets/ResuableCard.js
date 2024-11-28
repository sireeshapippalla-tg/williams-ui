// import React from "react";

// const ResuableCard = ({
//   title,
//   content,
//   footer,
//   gap = "4",
//   cardClass = "card_incident",
//   titleClass = "card-head",
//   bodyClass = "card-body",
//   footerClass = "card-footer",
// }) => {
//   return (
//     <div className={`card-group gap-${gap}`}>
//       <div className={`card ${cardClass}`}>
//         {/* Card Title */}
//         {title && (
//           <div className={titleClass}>
//             <h6>{title}</h6>
//           </div>
//         )}
//         {/* Card Body */}
//         <div className={bodyClass}>{content}</div>
//         {/* Card Footer (Optional) */}
//         {footer && <div className={footerClass}>{footer}</div>}
//       </div>
//     </div>
//   );
// };

// export default ResuableCard;

import React from "react";

const ResuableCard = ({
  title,
  content,
  footer,
  gap = "4",
  cardClass = "card_incident",
  titleClass = "card-head",
  bodyClass = "card-body",
  footerClass = "card-footer",
}) => {
  return (
    <div className={`card-group gap-${gap}`}>
      <div className={`card ${cardClass}`}>
        {/* Card Title and Content in One Row */}
        <div className="card-header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin:"4px" }}>
          {title && (
            <div className={titleClass} style={{ flex: 8}}>
              <h6 style={{fontSize:"14px", marginLeft:"10px"}}>{title}</h6>
            </div>
          )}
          {/* Optional: If you want to have some space between title and content */}
          {content && (
            <div className={bodyClass} style={{ flex: 1 }}>
              {content}
            </div>
          )}
        </div>

        {/* Card Footer (Optional) */}
        {footer && <div className={footerClass}>{footer}</div>}
      </div>
    </div>
  );
};

export default ResuableCard;

