import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AvalancheL1NodeData {
  l1Name: string;
  chainId: number;
  tokenSymbol: string;
  tokenName: string;
  initialSupply: string;
  vmType: 'subnet-evm' | 'custom-vm';
  consensusMechanism: 'poa' | 'pos';
  // Add more fields as per plan
  gasLimit: number;
  gasPriceStrategy: 'constant' | 'dynamic';
  baseFee: string;
  priorityFee: string;
  feeRecipient: string;
  feeBurning: boolean;
  minBaseFee: string;
  allocations: Array<{ address: string; amount: string }>;
  precompiledContracts: {
    nativeMinter: boolean;
    contractDeployerAllowlist: boolean;
    transactionAllowlist: boolean;
    feeManager: boolean;
  };
  adminAddresses: string[];
  controlKeyName: string;
  validatorStakeAmount: string;
  stakeDuration: string;
  additionalValidators: Array<{
    nodeId: string;
    blsPublicKey: string;
    proofOfPossession: string;
    stakeAmount: string;
  }>;
  targetNetwork: 'fuji' | 'local';
  customRpcUrl?: string;
  enableBlockExplorer: boolean;
  customExplorerUrl?: string;
  enableMetrics: boolean;
  webhookUrls: string[];
}

const AvalancheL1Node: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as AvalancheL1NodeData;
  const [isExpanded, setIsExpanded] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);

  const validateField = useCallback((field: string, value: any) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'l1Name':
        if (!value || value.length < 3) {
          errors.l1Name = 'L1 name must be at least 3 characters';
        } else {
          delete errors.l1Name;
        }
        break;
      case 'chainId':
        if (!value || value < 1 || value > 4294967295) {
          errors.chainId = 'Chain ID must be between 1 and 4294967295';
        } else {
          delete errors.chainId;
        }
        break;
      case 'tokenSymbol':
        if (!value || value.length < 3 || value.length > 6 || !/^[A-Z]+$/.test(value)) {
          errors.tokenSymbol = 'Token symbol must be 3-6 uppercase letters';
        } else {
          delete errors.tokenSymbol;
        }
        break;
      // Add more validation cases as needed
    }
    
    setValidationErrors(errors);
  }, [validationErrors]);

  const handleInputChange = (field: string, value: any) => {
    validateField(field, value);
    // Update data here - in a real implementation, this would update the node's data
    console.log(`Updating ${field} to ${value}`);
  };

  const handleTestConfiguration = async () => {
    setIsTesting(true);
    // Implement test logic here
    setTimeout(() => setIsTesting(false), 2000);
  };

  return (
    <TooltipProvider>
      <Card className={`w-96 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Avalanche L1 Deployment</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        
        <Handle type="target" position={Position.Top} />
        
        <CardContent className="pt-0">
          {isExpanded && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="validators">Validators</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="l1Name">L1 Name</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="l1Name"
                      value={nodeData.l1Name || ''}
                      onChange={(e) => handleInputChange('l1Name', e.target.value)}
                      placeholder="My Avalanche L1"
                    />
                    {validationErrors.l1Name ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : nodeData.l1Name ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : null}
                  </div>
                  {validationErrors.l1Name && (
                    <p className="text-xs text-red-500">{validationErrors.l1Name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chainId">Chain ID</Label>
                  <Input
                    id="chainId"
                    type="number"
                    value={nodeData.chainId || ''}
                    onChange={(e) => handleInputChange('chainId', parseInt(e.target.value))}
                    placeholder="12345"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tokenSymbol">Token Symbol</Label>
                  <Input
                    id="tokenSymbol"
                    value={nodeData.tokenSymbol || ''}
                    onChange={(e) => handleInputChange('tokenSymbol', e.target.value.toUpperCase())}
                    placeholder="AVAX"
                    maxLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tokenName">Token Name</Label>
                  <Input
                    id="tokenName"
                    value={nodeData.tokenName || ''}
                    onChange={(e) => handleInputChange('tokenName', e.target.value)}
                    placeholder="Avalanche Token"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="initialSupply">Initial Supply</Label>
                  <Input
                    id="initialSupply"
                    type="number"
                    value={nodeData.initialSupply || ''}
                    onChange={(e) => handleInputChange('initialSupply', e.target.value)}
                    placeholder="1000000000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vmType">VM Type</Label>
                  <Select value={nodeData.vmType} onValueChange={(value) => handleInputChange('vmType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select VM type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subnet-evm">Subnet-EVM</SelectItem>
                      <SelectItem value="custom-vm">Custom VM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="consensusMechanism">Consensus Mechanism</Label>
                  <Select value={nodeData.consensusMechanism} onValueChange={(value) => handleInputChange('consensusMechanism', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select consensus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poa">Proof of Authority (PoA)</SelectItem>
                      <SelectItem value="pos">Proof of Stake (PoS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center space-x-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Gas Configuration</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="gasLimit">Block Gas Limit</Label>
                      <Input
                        id="gasLimit"
                        type="number"
                        value={nodeData.gasLimit || 12000000}
                        onChange={(e) => handleInputChange('gasLimit', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gasPriceStrategy">Gas Price Strategy</Label>
                      <Select value={nodeData.gasPriceStrategy} onValueChange={(value) => handleInputChange('gasPriceStrategy', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="constant">Constant</SelectItem>
                          <SelectItem value="dynamic">Dynamic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {nodeData.gasPriceStrategy === 'dynamic' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="baseFee">Base Fee (gwei)</Label>
                          <Input
                            id="baseFee"
                            value={nodeData.baseFee || ''}
                            onChange={(e) => handleInputChange('baseFee', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="priorityFee">Priority Fee (gwei)</Label>
                          <Input
                            id="priorityFee"
                            value={nodeData.priorityFee || ''}
                            onChange={(e) => handleInputChange('priorityFee', e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </CollapsibleContent>
                </Collapsible>
                
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center space-x-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Fee Configuration</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="feeRecipient">Fee Recipient</Label>
                      <Input
                        id="feeRecipient"
                        value={nodeData.feeRecipient || ''}
                        onChange={(e) => handleInputChange('feeRecipient', e.target.value)}
                        placeholder="0x..."
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="feeBurning"
                        checked={nodeData.feeBurning || false}
                        onCheckedChange={(checked) => handleInputChange('feeBurning', checked)}
                      />
                      <Label htmlFor="feeBurning">Enable Fee Burning</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="minBaseFee">Min Base Fee (gwei)</Label>
                      <Input
                        id="minBaseFee"
                        value={nodeData.minBaseFee || ''}
                        onChange={(e) => handleInputChange('minBaseFee', e.target.value)}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center space-x-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Genesis Configuration</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pl-6">
                    <div className="space-y-2">
                      <Label>Initial Allocations</Label>
                      {/* Add allocation management UI here */}
                      <Button variant="outline" size="sm">Add Allocation</Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Precompiled Contracts</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="nativeMinter"
                            checked={nodeData.precompiledContracts?.nativeMinter || false}
                            onCheckedChange={(checked) => handleInputChange('precompiledContracts.nativeMinter', checked)}
                          />
                          <Label htmlFor="nativeMinter">Native Minter</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="contractDeployerAllowlist"
                            checked={nodeData.precompiledContracts?.contractDeployerAllowlist || false}
                            onCheckedChange={(checked) => handleInputChange('precompiledContracts.contractDeployerAllowlist', checked)}
                          />
                          <Label htmlFor="contractDeployerAllowlist">Contract Deployer Allowlist</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="transactionAllowlist"
                            checked={nodeData.precompiledContracts?.transactionAllowlist || false}
                            onCheckedChange={(checked) => handleInputChange('precompiledContracts.transactionAllowlist', checked)}
                          />
                          <Label htmlFor="transactionAllowlist">Transaction Allowlist</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="feeManager"
                            checked={nodeData.precompiledContracts?.feeManager || false}
                            onCheckedChange={(checked) => handleInputChange('precompiledContracts.feeManager', checked)}
                          />
                          <Label htmlFor="feeManager">Fee Manager</Label>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </TabsContent>
              
              <TabsContent value="validators" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="controlKeyName">Control Key Name</Label>
                  <Input
                    id="controlKeyName"
                    value={nodeData.controlKeyName || ''}
                    onChange={(e) => handleInputChange('controlKeyName', e.target.value)}
                    placeholder="my-control-key"
                  />
                </div>
                
                <Button variant="outline" size="sm">Generate New Key</Button>
                <Button variant="outline" size="sm">Import Existing Key</Button>
                
                <div className="space-y-2">
                  <Label htmlFor="validatorStakeAmount">Validator Stake Amount (AVAX)</Label>
                  <Input
                    id="validatorStakeAmount"
                    type="number"
                    value={nodeData.validatorStakeAmount || ''}
                    onChange={(e) => handleInputChange('validatorStakeAmount', e.target.value)}
                    placeholder="2000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stakeDuration">Stake Duration</Label>
                  <Input
                    id="stakeDuration"
                    value={nodeData.stakeDuration || ''}
                    onChange={(e) => handleInputChange('stakeDuration', e.target.value)}
                    placeholder="336h"
                  />
                </div>
                
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center space-x-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Additional Validators</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pl-6">
                    <Button variant="outline" size="sm">Add Validator</Button>
                    {/* Add validator management UI here */}
                  </CollapsibleContent>
                </Collapsible>
              </TabsContent>
            </Tabs>
          )}
          
          <div className="flex space-x-2 mt-4">
            <Button 
              onClick={handleTestConfiguration} 
              disabled={isTesting}
              variant="outline"
              size="sm"
            >
              {isTesting ? 'Testing...' : 'Test Configuration'}
            </Button>
            <Button size="sm">Deploy L1</Button>
          </div>
        </CardContent>
        
        <Handle type="source" position={Position.Bottom} />
      </Card>
    </TooltipProvider>
  );
};

export default AvalancheL1Node;
