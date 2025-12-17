import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, User, Building2, Phone, Mail, MapPin, Globe, Users } from 'lucide-react';
import { BusinessCardItem, ProcessingStatus } from '../types';

interface CardResultProps {
  item: BusinessCardItem;
}

const CardResult: React.FC<CardResultProps> = ({ item }) => {
  const isError = item.status === ProcessingStatus.ERROR;
  const isProcessing = item.status === ProcessingStatus.PROCESSING;
  const isCompleted = item.status === ProcessingStatus.COMPLETED;

  const results = item.data || [];
  const resultCount = results.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row h-[350px]">
      {/* Image Preview Section */}
      <div className="w-full md:w-5/12 bg-slate-100 relative min-h-[150px] md:min-h-0">
        <img
          src={item.previewUrl}
          alt="Business Card"
          className="w-full h-full object-contain p-2 absolute inset-0"
        />
        <div className="absolute top-2 right-2 flex gap-1">
            {isProcessing && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
            {isCompleted && <CheckCircle2 className="w-6 h-6 text-success bg-white rounded-full" />}
            {isError && <AlertCircle className="w-6 h-6 text-red-500 bg-white rounded-full" />}
        </div>
      </div>

      {/* Data Section */}
      <div className="w-full md:w-7/12 flex flex-col h-full">
        {isError && (
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-red-500 text-sm p-4 bg-red-50 rounded-lg text-center">
                    Failed to process: {item.error || 'Unknown error'}
                </div>
            </div>
        )}

        {isProcessing && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm">Analyzing text...</span>
            </div>
        )}

        {isCompleted && resultCount === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <p>No business cards detected.</p>
            </div>
        )}

        {isCompleted && resultCount > 0 && (
            <div className="flex flex-col h-full">
                <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {resultCount} Found
                    </span>
                    <span className="text-xs text-slate-400">Scroll for more</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {results.map((data, index) => (
                        <div key={index} className="space-y-3 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                            {/* Header for individual card if multiple exist */}
                            {resultCount > 1 && (
                                <div className="text-xs font-bold text-slate-300 mb-1">Card #{index + 1}</div>
                            )}

                            <div>
                                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    {data.fullName || "Unknown Name"}
                                </h4>
                                {data.jobTitle && <p className="text-slate-500 text-sm ml-6">{data.jobTitle}</p>}
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2 text-sm pl-2">
                                {data.companyName && (
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Building2 className="w-4 h-4 text-primary shrink-0" />
                                        <span className="font-medium">{data.companyName}</span>
                                    </div>
                                )}
                                
                                {(data.email) && (
                                    <div className="flex items-center gap-2 text-slate-600 overflow-hidden">
                                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="truncate">{data.email}</span>
                                    </div>
                                )}

                                {(data.phoneNumber) && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>{data.phoneNumber}</span>
                                    </div>
                                )}

                                {(data.website) && (
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                                        <a href={data.website} target="_blank" rel="noreferrer" className="hover:underline truncate">
                                            {data.website}
                                        </a>
                                    </div>
                                )}

                                {(data.address) && (
                                    <div className="flex items-start gap-2 text-slate-600">
                                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{data.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CardResult;