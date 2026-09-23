"use client";

import React from "react";

type PartnerLogoCardProps = {
  partner: {
    id: number;
    name: string;
    logo_url: string;
    website_url: string;
  };
};

export default function PartnerLogoCard({ partner }: PartnerLogoCardProps) {
  return (
    <a
      href={partner.website_url || '#'}
      target="_blank"
      rel="noreferrer"
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center min-w-[160px] h-[88px] hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      {partner.logo_url ? (
        <>
          <img
            src={partner.logo_url}
            alt={partner.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.classList.remove('hidden');
              }
            }}
          />
          <span className="hidden text-lg font-bold text-gray-800 text-center">{partner.name}</span>
        </>
      ) : (
        <span className="text-lg font-bold text-gray-800 text-center">{partner.name}</span>
      )}
    </a>
  );
}
