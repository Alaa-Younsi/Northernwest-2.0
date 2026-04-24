-- Northernwest — Seed Data
-- Run this ONCE in the Supabase SQL editor after running schema.sql

INSERT INTO categories (slug, name_en, name_fr, name_ar, description_en, description_fr, description_ar, sort_order)
VALUES
  (
    'keyboards',
    'Keyboards',
    'Claviers',
    'لوحات المفاتيح',
    'Mechanical keyboards for every setup — from compact 60% to full-size TKL.',
    'Claviers mécaniques pour toutes les configurations.',
    'لوحات مفاتيح ميكانيكية لكل إعداد.',
    1
  ),
  (
    'mouse',
    'Mouse',
    'Souris',
    'الفأرة',
    'Precision gaming mice with adjustable DPI and ergonomic designs.',
    'Souris gaming de précision avec DPI réglable.',
    'فئران ألعاب دقيقة مع DPI قابل للتعديل.',
    2
  ),
  (
    'headphones',
    'Headphones',
    'Casques',
    'سماعات الرأس',
    'Immersive audio headphones and headsets for gaming and music.',
    'Casques audio immersifs pour le gaming et la musique.',
    'سماعات رأس غامرة للألعاب والموسيقى.',
    3
  )
ON CONFLICT (slug) DO NOTHING;
