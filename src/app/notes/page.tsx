'use client'

import React, { useState } from 'react'
import {
  StickyNote,
  Plus,
  Pin,
  Trash2,
  Search,
  Sparkles,
  BookOpen,
  Filter,
  Check,
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import { allLessons } from '@/data/seed'
import type { Note } from '@/types/database'
import { toast } from 'sonner'

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, activeTrack } = useAppStore()
  const { language, t } = useLanguageStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null)

  // New Note Modal / Form state
  const [isCreating, setIsCreating] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newColor, setNewColor] = useState('#bbf7d4')
  const [newPinned, setNewPinned] = useState(false)
  const [newLessonId, setNewLessonId] = useState<string>('')

  const availableLessons = allLessons.filter((l) => l.track_type === activeTrack)

  // Filter notes
  const filteredNotes = notes
    .filter((note) => {
      if (!searchQuery) return true
      return note.content.toLowerCase().includes(searchQuery.toLowerCase())
    })
    .filter((note) => {
      if (!selectedColorFilter) return true
      return note.color === selectedColorFilter
    })
    // Sort pinned to top
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim()) {
      toast.error('Vui lòng nhập nội dung ghi chú!')
      return
    }

    addNote({
      lesson_id: newLessonId || null,
      vocabulary_id: null,
      content: newContent.trim(),
      color: newColor,
      pinned: newPinned,
    })

    setNewContent('')
    setIsCreating(false)
    toast.success('Đã ghim ghi chú mới lên bảng!')
  }

  const handleTogglePin = (note: Note) => {
    updateNote(note.id, { pinned: !note.pinned })
    toast.info(note.pinned ? 'Đã bỏ ghim ghi chú' : 'Đã ghim ghi chú lên đầu!')
  }

  const handleDelete = (id: string) => {
    deleteNote(id)
    toast.success('Đã xóa ghi chú')
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {activeTrack === 'medical' ? '🩺 Sổ Tay Y Khoa' : '💼 Sổ Tay TOEIC'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Sổ Tay Takenote & Ghi Nhớ
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Lưu trữ mẹo làm bài, tiền tố hậu tố y khoa và các lưu ý quan trọng trong bài học
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary !py-2.5 !px-5 text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Note Mới</span>
        </button>
      </div>

      {/* ─── Filter & Search Bar ─────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nội dung ghi chú..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-emerald-400 focus:bg-white"
          />
        </div>

        {/* Color Palette filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-gray-400">Lọc theo màu:</span>
          <button
            onClick={() => setSelectedColorFilter(null)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              selectedColorFilter === null
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          {['#bbf7d4', '#e9d5ff', '#ffe4e6', '#fef08a', '#bae6fd'].map((color) => (
            <button
              key={color}
              onClick={() =>
                setSelectedColorFilter(selectedColorFilter === color ? null : color)
              }
              className={`w-6 h-6 rounded-full border transition-transform flex items-center justify-center ${
                selectedColorFilter === color
                  ? 'scale-125 border-gray-800 shadow-2xs'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            >
              {selectedColorFilter === color && <Check className="w-3.5 h-3.5 text-gray-800" />}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Add Note Modal / Dialog ─────────────────── */}
      {isCreating && (
        <div className="p-6 rounded-3xl bg-white border-2 border-emerald-200 shadow-xl space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-emerald-600" />
              <span>Thêm Ghi Chú Mới</span>
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600"
            >
              Hủy
            </button>
          </div>

          <form onSubmit={handleCreateNote} className="space-y-4">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Nhập nội dung ghi chú bạn muốn ghi nhớ (ví dụ: mẹo phân biệt prescription vs diagnosis)..."
              rows={4}
              className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-emerald-400 focus:bg-white resize-none"
              required
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Color pick */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">Chọn màu giấy:</span>
                <div className="flex items-center gap-1.5">
                  {['#bbf7d4', '#e9d5ff', '#ffe4e6', '#fef08a', '#bae6fd'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        newColor === color ? 'scale-125 border-gray-800' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Pin toggle */}
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPinned}
                  onChange={(e) => setNewPinned(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <Pin className="w-3.5 h-3.5 text-gray-500" />
                <span>Ghim lên đầu bảng</span>
              </label>

              {/* Action */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="btn-primary !py-2 !px-5 text-xs font-bold shadow-xs"
                >
                  Lưu Ghi Chú
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ─── Notes Masonry / Grid ────────────────────── */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-gray-100 shadow-2xs space-y-3">
          <div className="text-4xl">📝</div>
          <h3 className="font-bold text-sm text-gray-800">Chưa có ghi chú nào phù hợp!</h3>
          <p className="text-xs text-gray-400">
            Hãy nhấn &ldquo;Tạo Note Mới&rdquo; hoặc ghi chú trực tiếp trong các bài học nhé.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-3xl border border-black/5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative min-h-[160px]"
              style={{ backgroundColor: note.color }}
            >
              {/* Card Header & Pin */}
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] text-black/40 font-mono">
                  {note.created_at ? note.created_at.slice(0, 10) : '2026-01-01'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTogglePin(note)}
                    className={`p-1 rounded-lg transition-colors ${
                      note.pinned
                        ? 'text-red-500 bg-black/5'
                        : 'text-black/30 hover:text-black/70'
                    }`}
                    title={note.pinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                  >
                    <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-red-500' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 rounded-lg text-black/30 hover:text-red-600 hover:bg-black/5 transition-colors opacity-0 group-hover:opacity-100"
                    title="Xóa ghi chú"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Note Content */}
              <p className="text-xs font-semibold text-gray-900 leading-relaxed whitespace-pre-wrap flex-1">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
