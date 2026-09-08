"use client";

import React from "react";

import { phoneTelHref, splitPhoneDisplay } from "@/lib/utils/phone";

type PhoneLinkProps = {
  phone: string;
  className?: string;
};

export function PhoneLink({ phone, className = "" }: PhoneLinkProps) {
  const text = phone.trim();
  if (!text) return null;

  const href = phoneTelHref(text);
  if (!href) {
    return <span className={className}>{text}</span>;
  }

  return (
    <a
      href={href}
      className={`text-decoration-none d-inline-flex align-items-center gap-1 ${className}`.trim()}
      style={{ color: "var(--bs-primary)" }}
    >
      <i className="bi bi-telephone-fill" aria-hidden style={{ fontSize: 12 }} />
      {text}
    </a>
  );
}

type PhoneLinksProps = {
  value: string;
  className?: string;
  separator?: string;
};

export function PhoneLinks({
  value,
  className = "",
  separator = " / ",
}: PhoneLinksProps) {
  const phones = splitPhoneDisplay(value);
  if (!phones.length) return null;

  if (phones.length === 1) {
    return <PhoneLink phone={phones[0]} className={className} />;
  }

  return (
    <>
      {phones.map((phone, index) => (
        <React.Fragment key={`${phone}-${index}`}>
          {index > 0 ? separator : null}
          <PhoneLink phone={phone} className={className} />
        </React.Fragment>
      ))}
    </>
  );
}
