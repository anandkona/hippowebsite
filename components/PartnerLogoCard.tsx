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
      className="flex items-center justify-center flex-shrink-0 group rounded-xl border border-border/50 bg-background/80 px-2 py-1 shadow-sm transition-all hover:border-primary/40 hover:shadow-md w-[240px] h-[86px]"
    >
      {partner.logo_url ? (
        <>
          <img
            src={partner.logo_url}
            alt={partner.name}
            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.classList.remove('hidden');
              }
            }}
          />
          <span className="hidden text-lg font-bold text-gray-800 text-center whitespace-nowrap">{partner.name}</span>
        </>
      ) : (
        <span className="text-lg font-bold text-gray-800 text-center whitespace-nowrap">{partner.name}</span>
      )}
    </a>
  );
}

