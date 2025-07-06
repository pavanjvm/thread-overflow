'use client';

import { useState } from 'react';
import type { PollOption } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface PollDisplayProps {
    options: PollOption[];
}

const PollDisplay = ({ options }: PollDisplayProps) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [voted, setVoted] = useState(false);
    
    const [pollResults, setPollResults] = useState(options.map(o => ({...o})));

    const totalVotes = pollResults.reduce((acc, option) => acc + option.votes, 0);

    const handleVote = () => {
        if (!selectedOption) return;

        setVoted(true);
        setPollResults(prevResults =>
            prevResults.map(opt =>
                opt.text === selectedOption ? { ...opt, votes: opt.votes + 1 } : opt
            )
        );
    };

    return (
        <Card className="bg-card/50">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {!voted ? (
                        <RadioGroup onValueChange={setSelectedOption} className="space-y-2">
                            {pollResults.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.text} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`}>{option.text}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    ) : (
                        <div className="space-y-3">
                            {pollResults.map((option, index) => {
                                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <p className="font-medium">{option.text}</p>
                                            <p className="text-muted-foreground">{option.votes} vote{option.votes !== 1 && 's'} ({percentage.toFixed(0)}%)</p>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                     {!voted ? (
                        <Button onClick={handleVote} disabled={!selectedOption}>Vote</Button>
                     ) : (
                        <p className="text-sm text-muted-foreground">Thank you for voting!</p>
                     )}
                     <p className="text-sm text-muted-foreground">{totalVotes} vote{totalVotes !== 1 && 's'} in total</p>
                </div>

            </CardContent>
        </Card>
    );
};

export default PollDisplay;
