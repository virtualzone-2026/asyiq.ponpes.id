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

export default defineConfig([
  {
    // =====================================================
    // WORKSPACE
    // =====================================================

    name: 'asyiq-ponpes-id',

    title: 'Asyiqul Quran',

    projectId:
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
      'ID_PROJECT_ANDA',

    dataset:
      process.env.NEXT_PUBLIC_SANITY_DATASET ||
      'production',

    basePath: '/studio',

    // =====================================================
    // PLUGINS
    // =====================================================

    plugins: [
      structureTool({
        structure: (S) =>
          S.list()
            .title('Content')
            .items([
              // =================================================
              // 1. PROGRAM DONASI
              // =================================================

              S.listItem()
                .title('Program Donasi')
                .child(
                  S.documentTypeList('program').title(
                    'Program Donasi'
                  )
                ),

              // =================================================
              // 2. LAPORAN PENYALURAN
              // =================================================

              S.listItem()
                .title('Laporan Penyaluran')
                .child(
                  S.documentTypeList('laporan').title(
                    'Laporan Penyaluran'
                  )
                ),

              // =================================================
              // 3. KATEGORI
              // =================================================

              S.listItem()
                .title('Kategori')
                .child(
                  S.documentTypeList('category').title(
                    'Kategori'
                  )
                ),

              // =================================================
              // 4. BERITA & ARTIKEL
              // =================================================

              S.listItem()
                .title('Berita & Artikel')
                .child(
                  S.documentTypeList('news').title(
                    'Berita & Artikel'
                  )
                ),

              // =================================================
              // 5. DONATION TRANSACTION
              // =================================================

              S.listItem()
                .title(
                  'Donation Transaction (Pending Box)'
                )
                .child(
                  S.documentTypeList(
                    'donationTransaction'
                  ).title(
                    'Donation Transaction (Pending Box)'
                  )
                ),

              // =================================================
              // PEMBATAS
              // =================================================

              S.divider(),

              // =================================================
              // 6. PENDAFTARAN FUNDRAISER
              // =================================================

              S.listItem()
                .title('Pendaftaran Fundraiser')
                .child(
                  S.documentTypeList(
                    'fundraiser'
                  ).title(
                    'Pendaftaran Fundraiser'
                  )
                ),

              // =================================================
              // 7. PENARIKAN KOMISI FUNDRAISER
              // =================================================

              S.listItem()
                .title('Penarikan Komisi')
                .child(
                  S.list()
                    .title(
                      'Penarikan Komisi Fundraiser'
                    )
                    .items([
                      // =========================================
                      // MENUNGGU
                      // =========================================

                      S.listItem()
                        .title('⏳ Menunggu')
                        .child(
                          S.documentList()
                            .title(
                              'Menunggu Persetujuan'
                            )
                            .schemaType(
                              'fundraiserWithdrawal'
                            )
                            .filter(
                              '_type == "fundraiserWithdrawal" && status == "pending"'
                            )
                            .defaultOrdering([
                              {
                                field: 'requestedAt',
                                direction: 'desc',
                              },
                            ])
                        ),

                      // =========================================
                      // DISETUJUI
                      // =========================================

                      S.listItem()
                        .title('✅ Disetujui')
                        .child(
                          S.documentList()
                            .title(
                              'Penarikan Disetujui'
                            )
                            .schemaType(
                              'fundraiserWithdrawal'
                            )
                            .filter(
                              '_type == "fundraiserWithdrawal" && status == "approved"'
                            )
                            .defaultOrdering([
                              {
                                field: 'requestedAt',
                                direction: 'desc',
                              },
                            ])
                        ),

                      // =========================================
                      // SUDAH DIBAYAR
                      // =========================================

                      S.listItem()
                        .title('💸 Sudah Dibayar')
                        .child(
                          S.documentList()
                            .title(
                              'Komisi Sudah Dibayar'
                            )
                            .schemaType(
                              'fundraiserWithdrawal'
                            )
                            .filter(
                              '_type == "fundraiserWithdrawal" && status == "paid"'
                            )
                            .defaultOrdering([
                              {
                                field: 'paidAt',
                                direction: 'desc',
                              },
                            ])
                        ),

                      // =========================================
                      // DITOLAK
                      // =========================================

                      S.listItem()
                        .title('❌ Ditolak')
                        .child(
                          S.documentList()
                            .title(
                              'Penarikan Ditolak'
                            )
                            .schemaType(
                              'fundraiserWithdrawal'
                            )
                            .filter(
                              '_type == "fundraiserWithdrawal" && status == "rejected"'
                            )
                            .defaultOrdering([
                              {
                                field: 'requestedAt',
                                direction: 'desc',
                              },
                            ])
                        ),

                      // =========================================
                      // DIBATALKAN
                      // =========================================

                      S.listItem()
                        .title('🚫 Dibatalkan')
                        .child(
                          S.documentList()
                            .title(
                              'Penarikan Dibatalkan'
                            )
                            .schemaType(
                              'fundraiserWithdrawal'
                            )
                            .filter(
                              '_type == "fundraiserWithdrawal" && status == "cancelled"'
                            )
                            .defaultOrdering([
                              {
                                field: 'requestedAt',
                                direction: 'desc',
                              },
                            ])
                        ),

                      // =========================================
                      // PEMBATAS
                      // =========================================

                      S.divider(),

                      // =========================================
                      // SEMUA RIWAYAT
                      // =========================================

                      S.listItem()
                        .title('📋 Semua Penarikan')
                        .child(
                          S.documentList()
                            .title(
                              'Semua Penarikan Komisi'
                            )
                            .schemaType(
                              'fundraiserWithdrawal'
                            )
                            .filter(
                              '_type == "fundraiserWithdrawal"'
                            )
                            .defaultOrdering([
                              {
                                field: 'requestedAt',
                                direction: 'desc',
                              },
                            ])
                        ),
                    ])
                ),
            ]),
      }),
    ],

    // =====================================================
    // SCHEMA
    // =====================================================

    schema: {
      types: schemaTypes,
    },

    // =====================================================
    // THEME
    // =====================================================

    theme: emeraldTheme,

    // =====================================================
    // STUDIO CUSTOMIZATION
    // =====================================================

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

            // ===============================================
            // CUSTOM HEADER / LOGO
            // ===============================================

            React.createElement(
              'div',

              {
                style: {
                  background: '#e6f7f0',

                  padding: '16px 24px',

                  display: 'flex',
                  alignItems: 'center',

                  borderBottom:
                    '1px solid #c2ebd9',

                  boxShadow:
                    '0 1px 2px rgba(0,0,0,0.02)',
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

            // ===============================================
            // NAVBAR DEFAULT SANITY
            // ===============================================

            props.renderDefault(props)
          );
        },
      },
    },
  },
]);