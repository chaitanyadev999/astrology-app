import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen } from 'lucide-react';

export default function Encyclopedia() {
  const [content, setContent] = useState('Loading comprehensive encyclopedia...');

  useEffect(() => {
    // Fetch the raw markdown file
    fetch('/astrology_data.md')
      .then(res => res.text())
      .then(text => {
        // Remove conversational artifacts to make it look like a clean encyclopedia
        const cleanText = text.replace(/<span style="display:none">.*?<\/span>/g, '')
                              .replace(/<div align="center">.*?<\/div>/g, '')
                              .replace(/---/g, '')
                              .replace(/# yes/g, '')
                              .replace(/# next/g, '')
                              .replace(/# asalu astrology reading eni unayi ee earth meda list ivi give like lish chaina ,us ,india ,south india telugu chart ,north india ....all list ivi/g, '# Astrology Chart Styles on Earth')
                              .replace(/# give name names that place give 11 list/g, '# 11 Chart Styles List')
                              .replace(/# ipudu astrology ani konalu chustundi .......deeep values ...deep anta chutundi ...deep yogas god and bad a to z every thing give list 1000 list/g, '# Deep Astrological Values (Yogas, Doshas, Core Meanings)')
                              .replace(/# yes ,buisness name reader ,name reader ,numberlog also ,invesment also see based laba kaksa...lottry win or not this time lotary good ornot .......each every minttues analyis ......presnt chart and birth chart every thing ....which food get strong .....which maha dasa see/g, '# Complete Astrology Mastery System');
        setContent(cleanText);
      })
      .catch(err => {
        setContent('# Error\nCould not load the encyclopedia data.');
      });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-400" />
          Astrological Encyclopedia
        </h2>
        <p className="text-slate-400 mt-2">The complete 1000-item master list containing deep insights on signs, houses, yogas, doshas, food, and investments.</p>
      </header>

      <div className="prose prose-invert prose-indigo max-w-none bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
