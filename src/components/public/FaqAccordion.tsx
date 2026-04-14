"use client";

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

interface FaqAccordionProps {
    faqs: { question: string; answer: string }[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
    if (!faqs || faqs.length === 0) return null;

    return (
        <Accordion.Root type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
                <Accordion.Item key={index} value={`item-${index}`} className="bg-white rounded-[16px] border border-[#cbd5e1] overflow-hidden">
                    <Accordion.Header>
                        <Accordion.Trigger className="w-full flex items-center justify-between p-6 text-left hover:bg-[#f7f8fa] transition-colors group">
                            <span className="font-['Nunito'] font-medium text-[16px] text-[#1a202c] pr-4">{faq.question}</span>
                            <ChevronDown size={20} className="text-[#64748b] shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                        <div className="px-6 pb-6">
                            <p className="font-['Nunito'] text-[14px] text-[#4a5568] leading-[22px] whitespace-pre-line">{faq.answer}</p>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
            ))}
        </Accordion.Root>
    );
}
