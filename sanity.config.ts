// sanity.config.ts

import { defineConfig, buildLegacyTheme } from 'sanity';
import { structureTool } from 'sanity/structure';
import React from 'react';

import { schemaTypes } from './sanity/schemaTypes';

// =========================================================
// CUSTOM THEME
// =========================================================

const emeraldTheme = buildLegacyTheme({
  '--black': '#1f2937',
  '--white': '#ffffff',
  '--brand-primary': '#10b981',
  '--component-bg': '#ffffff',
  '--component-text-color': '#1f2937',
  '--focus-color': '#fbbf24',
});

// =========================================================
// SANITY CONFIG
// =========================================================

export default defineConfig({
  name: 'asyiq-ponpes-id',
  title: 'Asyiqul Quran',

  projectId:
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    'ID_PROJECT_ANDA',

  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    'production',

  basePath: '/studio',

  // =========================================================
  // PLUGINS & STRUCTURE
  // =========================================================

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // 1. PROGRAM DONASI
            S.listItem()
              .title('Program Donasi')
              .child(
                S.documentTypeList('program').title('Program Donasi')
              ),

            // 2. LAPORAN PENYALURAN (Opsional: pastikan tipe 'laporan' ada di schemaTypes)
            S.listItem()
              .title('Laporan Penyaluran')
              .child(
                S.documentTypeList('laporan').title('Laporan Penyaluran')
              ),

            // 3. KATEGORI (Opsional: pastikan tipe 'category' ada di schemaTypes)
            S.listItem()
              .title('Kategori')
              .child(
                S.documentTypeList('category').title('Kategori')
              ),

            // 4. BERITA & ARTIKEL (Opsional: pastikan tipe 'news' ada di schemaTypes)
            S.listItem()
              .title('Berita & Artikel')
              .child(
                S.documentTypeList('news').title('Berita & Artikel')
              ),

            // 5. DONATION TRANSACTION
            S.listItem()
              .title('Donation Transaction')
              .child(
                S.documentTypeList('donationTransaction').title('Donation Transaction')
              ),

            S.divider(),

            // 6. PENDAFTARAN FUNDRAISER
            S.listItem()
              .title('Pendaftaran Fundraiser')
              .child(
                S.documentTypeList('fundraiser').title('Pendaftaran Fundraiser')
              ),

            // 7. PENARIKAN KOMISI FUNDRAISER
            S.listItem()
              .title('Penarikan Komisi')
              .child(
                S.documentList()
                  .title('Semua Penarikan Komisi')
                  .schemaType('fundraiserWithdrawal')
                  .filter('_type == "fundraiserWithdrawal"')
                  .defaultOrdering([
                    {
                      field: '_createdAt',
                      direction: 'desc',
                    },
                  ])
              ),
          ]),
    }),
  ],

  // =========================================================
  // SCHEMA
  // =========================================================

  schema: {
    types: schemaTypes,
  },

  // =========================================================
  // THEME
  // =========================================================

  theme: emeraldTheme,

  // =========================================================
  // STUDIO CUSTOMIZATION
  // =========================================================

  studio: {
    components: {
      navbar: (props) => {
        return React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
            },
          },
          React.createElement(
            'div',
            {
              style: {
                background: '#e6f7f0',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #c2ebd9',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              },
            },
            React.createElement('img', {
              src: '/images/asyiq.png',
              alt: 'Logo asyiq.ponpes.id',
              style: {
                height: '52px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
              },
            })
          ),
          props.renderDefault(props)
        );
      },
    },
  },
});