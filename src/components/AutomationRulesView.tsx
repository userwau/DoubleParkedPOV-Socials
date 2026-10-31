import React, { useState } from 'react';
import { AutomationRule, RuleTargetPlatform, VALIDATION_LIMITS } from '../types';
import { Plus, Trash2, Zap, CheckCircle2, PauseCircle } from 'lucide-react';

interface AutomationRulesViewProps {
  rules: AutomationRule[];
  onCreateRule: (rule: {
    name: string;
    sourceChannel: string;
    targetPlatform: RuleTargetPlatform;
    delayMinutes: number;
    stripWatermark: boolean;
    autoCaptions: boolean;
  }) => Promise<void>;
  onToggleRule: (rule: AutomationRule) => Promise<void>;
  onDeleteRule: (ruleId: string) => Promise<void>;
}

const TARGET_LABELS: Record<RuleTargetPlatform, string> = {
  all: 'All Channels (X + Reels + TikTok)',
  x: 'X Native Video Only',
  reels: 'Instagram Reels Only',
  tiktok: 'TikTok Feed Only',
};

export const AutomationRulesView: React.FC<AutomationRulesViewProps> = ({
  rules,
  onCreateRule,
  onToggleRule,
  onDeleteRule,
}) => {
  const [name, setName] = useState('');
  const [sourceChannel, setSourceChannel] = useState('@CreatorChannel');
  const [targetPlatform, setTargetPlatform] = useState<RuleTargetPlatform>('all');
  const [delayMinutes, setDelayMinutes] = useState(30);
  const [stripWatermark, setStripWatermark] = useState(true);
  const [autoCaptions, setAutoCaptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sourceChannel.trim()) return;
    setSubmitting(true);
    try {
      await onCreateRule({
        name: name.trim().slice(0, VALIDATION_LIMITS.RULE_NAME_MAX),
        sourceChannel: sourceChannel.trim().slice(0, VALIDATION_LIMITS.CHANNEL_MAX),
        targetPlatform,
        delayMinutes: Math.max(0, Math.min(10080, Number(delayMinutes) || 0)),
        stripWatermark,
        autoCaptions,
      });
      setName('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 5 Columns: Create New Automation Pipeline Rule */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4"
      >
        <div className="pb-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">
            Create Syndication Trigger Rule
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatically ingest new YouTube Shorts and dispatch to target feeds
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Pipeline Name ({name.length}/{VALIDATION_LIMITS.RULE_NAME_MAX})
          </label>
          <input
            type="text"
            required
            value={name}
            maxLength={VALIDATION_LIMITS.RULE_NAME_MAX}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Daily Shorts to TikTok + X Stagger"
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Source YouTube Channel
            </label>
            <input
              type="text"
              required
              value={sourceChannel}
              maxLength={VALIDATION_LIMITS.CHANNEL_MAX}
              onChange={(e) => setSourceChannel(e.target.value)}
              placeholder="@YourChannel"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Publish Stagger Delay (Min)
            </label>
            <input
              type="number"
              min={0}
              max={10080}
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Target Destination Bundle
          </label>
          <select
            value={targetPlatform}
            onChange={(e) => setTargetPlatform(e.target.value as RuleTargetPlatform)}
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-none focus:border-blue-500"
          >
            {(Object.keys(TARGET_LABELS) as RuleTargetPlatform[]).map((k) => (
              <option key={k} value={k}>
                {TARGET_LABELS[k]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-md cursor-pointer">
            <span className="text-xs text-slate-200">
              Strip YouTube Watermark & Outros
            </span>
            <input
              type="checkbox"
              checked={stripWatermark}
              onChange={(e) => setStripWatermark(e.target.checked)}
              className="rounded border-slate-700 text-blue-600"
            />
          </label>

          <label className="flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-md cursor-pointer">
            <span className="text-xs text-slate-200">
              Auto-Burn Safe-Zone Kinetic Captions
            </span>
            <input
              type="checkbox"
              checked={autoCaptions}
              onChange={(e) => setAutoCaptions(e.target.checked)}
              className="rounded border-slate-700 text-blue-600"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="w-full py-2 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-md transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          {submitting ? 'Creating Rule...' : 'Add Automation Rule'}
        </button>
      </form>

      {/* Right 7 Columns: Active Rules Table */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Configured Automation Rules
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Trigger-to-outcome rules listening for new YouTube Short uploads
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {rules.filter((r) => r.enabled).length} active / {rules.length} total
          </span>
        </div>

        {rules.length === 0 ? (
          <div className="p-10 text-center">
            <Zap className="w-7 h-7 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">
              No automation rules configured yet
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Create your first rule on the left to automate cross-posting whenever a new YouTube Short goes live.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">
                      {rule.name}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {rule.sourceChannel}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{TARGET_LABELS[rule.targetPlatform]}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">+{rule.delayMinutes}m delay</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {rule.stripWatermark ? 'Watermark stripped' : 'Raw source'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{rule.autoCaptions ? 'Auto captions' : 'No captions'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleRule(rule)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      rule.enabled
                        ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {rule.enabled ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Active
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
                        Paused
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRule(rule.id)}
                    title="Delete rule"
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
