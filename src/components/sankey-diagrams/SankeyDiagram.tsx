import { FC, useCallback, useState } from 'react';
import { 
  Box, 
  Typography, 
  useTheme as useMuiTheme, 
  ToggleButtonGroup, 
  ToggleButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,

  Alert,
  Button,
  Chip,
  ButtonGroup,
  Tooltip
} from '@mui/material';
import { ResponsiveSankey } from '@nivo/sankey';
import { SankeyData } from '../../types/financials';
import { BarChart, TableChart, Code } from '@mui/icons-material';

interface SankeyDiagramProps {
  data: SankeyData;
  title: string;
  period?: string;
  height?: number;
  rawData?: Record<string, any>;
}

/**
 * Enhanced Sankey diagram component with data table view
 */
export const SankeyDiagram: FC<SankeyDiagramProps> = ({ 
  data, 
  title,
  period,
  height = 500,
  rawData
}) => {
  const theme = useMuiTheme();
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'json'>('chart');
  const [unitMode, setUnitMode] = useState<'raw' | 'K' | 'M' | 'B'>('raw');

  // Format node value for tooltip - safely handle undefined or zero values
  const formatValue = useCallback((value: number | undefined, unit: 'raw' | 'K' | 'M' | 'B' = unitMode) => {
    if (value === undefined || value === null) return '$0';
    if (value === 0) return '$0';
    
    // For very small values (near zero), show a special format
    if (value > 0 && value < 0.01) return '<$0.01';
    
    // Apply unit conversion
    let formattedValue = value;
    let unitSuffix = '';
    
    if (unit === 'K') {
      formattedValue = value / 1000;
      unitSuffix = 'K';
    } else if (unit === 'M') {
      formattedValue = value / 1000000;
      unitSuffix = 'M';
    } else if (unit === 'B') {
      formattedValue = value / 1000000000;
      unitSuffix = 'B';
    }
    
    return `$${formattedValue.toLocaleString('en-US', { 
      maximumFractionDigits: unit === 'raw' ? 0 : 2,
      minimumFractionDigits: 0,
      maximumSignificantDigits: unit === 'raw' ? 10 : 4
    })}${unitSuffix}`;
  }, [unitMode]);
  
  // Define node colors with better visibility in both light and dark modes
  const getNodeColor = useCallback((node: { id: string }) => {
    const isDark = theme.palette.mode === 'dark';
    
    // More balanced color map with moderated saturation for dark mode
    const colorMap: Record<string, string> = {
      // Income statement colors - moderate saturation for dark mode
      revenue: isDark ? '#34d399' : '#22c55e', // Green
      costOfRevenue: isDark ? '#f87171' : '#ef4444', // Red
      grossProfit: isDark ? '#60a5fa' : '#3b82f6', // Blue
      operatingExpenses: isDark ? '#fb923c' : '#f97316', // Orange
      operatingIncome: isDark ? '#a78bfa' : '#8b5cf6', // Purple
      netIncome: isDark ? '#818cf8' : '#4f46e5', // Indigo
      
      // Balance sheet colors
      totalAssets: isDark ? '#34d399' : '#22c55e', // Green
      cashAndEquivalents: isDark ? '#34d399' : '#10b981', // Teal
      shortTermInvestments: isDark ? '#2dd4bf' : '#14b8a6', // Teal variant
      accountsReceivable: isDark ? '#86efac' : '#34d399', // Light green
      inventory: isDark ? '#fcd34d' : '#f59e0b', // Yellow
      propertyPlantEquipment: isDark ? '#fbbf24' : '#d97706', // Amber
      goodwill: isDark ? '#fb923c' : '#ea580c', // Orange
      intangibleAssets: isDark ? '#f87171' : '#dc2626', // Red
      otherAssets: isDark ? '#a3e635' : '#84cc16', // Lime
      otherAssetsCalculated: isDark ? '#a3e635' : '#84cc16', // Lime
      totalLiabilities: isDark ? '#ef4444' : '#dc2626', // Red
      accountsPayable: isDark ? '#fca5a5' : '#f87171', // Light red
      shortTermDebt: isDark ? '#ef4444' : '#dc2626', // Red
      longTermDebt: isDark ? '#dc2626' : '#b91c1c', // Dark red
      otherLiabilities: isDark ? '#b91c1c' : '#991b1b', // Darker red
      totalEquity: isDark ? '#60a5fa' : '#3b82f6', // Blue
      
      // Cash flow colors
      startingCash: isDark ? '#34d399' : '#22c55e', // Green
      operations: isDark ? '#60a5fa' : '#3b82f6', // Blue
      investing: isDark ? '#ef4444' : '#dc2626', // Red
      financing: isDark ? '#fb923c' : '#f97316', // Orange
      endingCash: isDark ? '#a78bfa' : '#8b5cf6', // Purple
      capex: isDark ? '#ef4444' : '#dc2626', // Red
      dividends: isDark ? '#f97316' : '#ea580c', // Orange
      stockRepurchase: isDark ? '#b91c1c' : '#991b1b', // Dark red
    };
    
    return colorMap[node.id] || (isDark ? theme.palette.primary.main : theme.palette.primary.main);
  }, [theme]);
  
  // Get proper theme colors for labels
  const getThemeColors = () => {
    const darkMode = theme.palette.mode === 'dark';
    
    return {
      textColor: darkMode ? theme.palette.text.primary : theme.palette.text.primary,
      background: darkMode ? theme.palette.background.paper : theme.palette.background.paper,
    };
  };
  
  const { textColor, background } = getThemeColors();

  // Handle view mode change
  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: 'chart' | 'table' | 'json' | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  // Create a sorted table data from nodes - with safety checks
  const getTableData = () => {
    if (!data.nodes || !data.nodes.length) return {};
    
    // Group nodes by categories
    const groupedNodes = data.nodes.reduce((acc, node) => {
      if (!node) return acc;

      // Determine category based on node ID patterns
      let category = 'Other';
      
      if (['revenue', 'costOfRevenue', 'grossProfit', 'operatingExpenses', 'operatingIncome', 'netIncome'].includes(node.id)) {
        category = 'Income Statement';
      } else if (['totalAssets', 'cashAndEquivalents', 'shortTermInvestments', 'inventory', 'propertyPlantEquipment', 'goodwill', 'intangibleAssets'].includes(node.id)) {
        category = 'Assets';
      } else if (['totalLiabilities', 'accountsPayable', 'shortTermDebt', 'longTermDebt', 'otherLiabilities'].includes(node.id)) {
        category = 'Liabilities';
      } else if (['totalEquity'].includes(node.id)) {
        category = 'Equity';
      } else if (['startingCash', 'operations', 'investing', 'financing', 'endingCash', 'capex', 'dividends'].includes(node.id)) {
        category = 'Cash Flow';
      }
      
      // Add to category
      if (!acc[category]) {
        acc[category] = [];
      }
      
      acc[category].push(node);
      return acc;
    }, {} as Record<string, typeof data.nodes>);
    
    // Sort each category - safely
    Object.keys(groupedNodes).forEach(category => {
      if (groupedNodes[category] && Array.isArray(groupedNodes[category])) {
        groupedNodes[category].sort((a, b) => {
          const valueA = a?.value ?? 0;
          const valueB = b?.value ?? 0;
          return valueB - valueA;
        });
      }
    });
    
    return groupedNodes;
  };

  // Format JSON for display
  const formatJson = (data: any) => {
    if (!data) return 'No data available';
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return 'Error formatting JSON data';
    }
  };
  
  // For the ResponsiveSankey component data, ensure all nodes have value properties:
  const prepareDataForSankey = (data: SankeyData): SankeyData => {
    if (!data.nodes || !data.nodes.length) return { nodes: [], links: [] };
    
    // Ensure each node has a value, defaulting to 1 if not provided
    const nodesWithValues = data.nodes.map(node => ({
      ...node,
      value: node.value !== undefined ? node.value : 1
    }));
    
    // Filter out any links with missing sources or targets
    const validLinks = data.links.filter(link => {
      const hasSource = nodesWithValues.some(n => n.id === link.source);
      const hasTarget = nodesWithValues.some(n => n.id === link.target);
      return hasSource && hasTarget;
    });
    
    return {
      nodes: nodesWithValues,
      links: validLinks
    };
  };

  // Add a debug panel component
  const DebugPanel: FC<{ data: any }> = ({ data }) => {
    const [showDebug, setShowDebug] = useState(false);
    
    if (!showDebug) {
      return (
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button 
            size="small" 
            variant="text" 
            onClick={() => setShowDebug(true)}
            sx={{ fontSize: '0.7rem' }}
          >
            Show Debug Info
          </Button>
        </Box>
      );
    }
    
    return (
      <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, fontSize: '0.8rem' }}>
        <Typography variant="caption" component="div" gutterBottom>
          <strong>Debug Information:</strong>
        </Typography>
        <Typography variant="caption" component="div" sx={{ mb: 1 }}>
          {data.nodes.length} nodes and {data.links.length} links found
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {data.nodes.map((node: any, index: number) => (
            <Chip 
              key={index}
              size="small"
              label={`${node.name}: ${formatValue(node.value)}`} 
              sx={{ fontSize: '0.65rem' }}
            />
          ))}
        </Box>
        <Button 
          size="small" 
          variant="text" 
          onClick={() => setShowDebug(false)}
          sx={{ mt: 1, fontSize: '0.7rem' }}
        >
          Hide Debug Info
        </Button>
      </Box>
    );
  };

  // Handle unit mode change
  const handleUnitChange = (newUnit: 'raw' | 'K' | 'M' | 'B') => {
    setUnitMode(newUnit);
  };

  if (!data.nodes.length) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          p: 4, 
          height,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexDirection: 'column'
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No data available for {title}
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {title}
          </Typography>
          {period && (
            <Typography variant="caption" color="text.secondary">
              Period Ending: {period}
            </Typography>
          )}
        </Box>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
          size="small"
        >
          <ToggleButton value="chart" aria-label="chart view">
            <BarChart />
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <TableChart />
          </ToggleButton>
          <ToggleButton value="json" aria-label="json view">
            <Code />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {viewMode === 'chart' ? (
        <Box sx={{ 
          height: height - 100, 
          width: '100%',
          position: 'relative',
          ...(theme.palette.mode === 'dark' && {
            backgroundColor: '#000',
            borderRadius: 1,
          })
        }}>
          <ResponsiveSankey
            data={prepareDataForSankey(data)}
            margin={{ top: 40, right: 200, bottom: 40, left: 200 }}
            align="justify"
            colors={getNodeColor}
            linkOpacity={theme.palette.mode === 'dark' ? 0.4 : 0.5}
            linkHoverOpacity={0.85}
            linkContract={3}
            linkBlendMode={theme.palette.mode === 'dark' ? 'normal' : 'multiply'}
            enableLinkGradient={true}
            nodeBorderWidth={1}
            nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }}
            label={node => node.name || node.id}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={16}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
            layers={['links', 'nodes', 'labels', 'legends']}
            theme={{
              tooltip: {
                container: {
                  background: 'none',
                  boxShadow: 'none',
                  padding: 0
                }
              },
              labels: {
                text: {
                  fill: textColor,
                  fontWeight: 600,
                  fontSize: 14,
                  textShadow: theme.palette.mode === 'dark' 
                    ? '0 0 3px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)' 
                    : 'none'
                }
              }
            }}
            animate={true}
            motionConfig="gentle"
            nodeTooltip={({ node }) => (
              <div
                style={{
                  background,
                  padding: '12px',
                  borderRadius: '4px',
                  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
                  color: textColor
                }}
              >
                <strong>{node.label || node.id}</strong><br />
                <span>{formatValue(node.value)}</span>
              </div>
            )}
            linkTooltip={({ link }) => (
              <div
                style={{
                  background,
                  padding: '12px',
                  borderRadius: '4px',
                  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
                  color: textColor
                }}
              >
                <strong>{(link.source?.label || link.source) + ' → ' + (link.target?.label || link.target)}</strong><br />
                <span>{formatValue(link.value)}</span>
              </div>
            )}
          />
        </Box>
      ) : viewMode === 'table' ? (
        <Box sx={{ overflowX: 'auto' }}>
          {/* Unit selector for table view */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1, display: 'inline-block' }}>
                Units:
              </Typography>
              <ButtonGroup size="small" aria-label="unit selector">
                <Tooltip title="Raw Values">
                  <Button 
                    variant={unitMode === 'raw' ? 'contained' : 'outlined'} 
                    onClick={() => handleUnitChange('raw')}
                    sx={{ px: 1, minWidth: '36px', fontSize: '0.75rem' }}
                  >
                    Raw
                  </Button>
                </Tooltip>
                <Tooltip title="Thousands">
                  <Button 
                    variant={unitMode === 'K' ? 'contained' : 'outlined'} 
                    onClick={() => handleUnitChange('K')}
                    sx={{ px: 1, minWidth: '36px', fontSize: '0.75rem' }}
                  >
                    K
                  </Button>
                </Tooltip>
                <Tooltip title="Millions">
                  <Button 
                    variant={unitMode === 'M' ? 'contained' : 'outlined'} 
                    onClick={() => handleUnitChange('M')}
                    sx={{ px: 1, minWidth: '36px', fontSize: '0.75rem' }}
                  >
                    M
                  </Button>
                </Tooltip>
                <Tooltip title="Billions">
                  <Button 
                    variant={unitMode === 'B' ? 'contained' : 'outlined'} 
                    onClick={() => handleUnitChange('B')}
                    sx={{ px: 1, minWidth: '36px', fontSize: '0.75rem' }}
                  >
                    B
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </Box>
          </Box>

          {Object.keys(getTableData()).length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No table data available. This might be because the data exists but values are zero or missing.
            </Alert>
          ) : (
            Object.entries(getTableData()).map(([category, nodes]) => {
              if (!nodes || !nodes.length) return null;
              
              return (
                <Box key={category} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    {category}
                  </Typography>
                  <TableContainer component={Box} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Item</strong></TableCell>
                          <TableCell align="right"><strong>Value</strong></TableCell>
                          <TableCell align="right"><strong>% of Total</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {nodes.map((node, index) => {
                          if (!node) return null;
                          
                          // Calculate percentage based on category total - safely
                          const categoryTotal = nodes.reduce((acc, n) => {
                            if (!n) return acc;
                            return acc + (n.value || 0);
                          }, 0);
                          
                          const percentage = categoryTotal > 0 ? ((node.value || 0) / categoryTotal) * 100 : 0;
                          
                          return (
                            <TableRow key={node.id || index}>
                              <TableCell component="th" scope="row">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box 
                                    sx={{ 
                                      width: 12, 
                                      height: 12, 
                                      backgroundColor: getNodeColor({ id: node.id }),
                                      borderRadius: '50%',
                                      mr: 1
                                    }} 
                                  />
                                  {node.name || node.id}
                                </Box>
                              </TableCell>
                              <TableCell align="right">{formatValue(node.value, unitMode)}</TableCell>
                              <TableCell align="right">{percentage.toFixed(1)}%</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              );
            })
          )}
          
          <DebugPanel data={data} />
        </Box>
      ) : (
        // JSON View
        <Box sx={{ 
          overflowX: 'auto', 
          maxHeight: height - 100,
          bgcolor: theme.palette.mode === 'dark' ? '#1e1e2f' : '#f5f5f5',
          p: 2,
          borderRadius: 1,
          fontFamily: 'monospace'
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>API Query:</Typography>
          <Box 
            sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: theme.palette.mode === 'dark' ? '#2d2d3f' : '#e9e9e9',
              borderRadius: 1,
              fontSize: '0.85rem',
              wordBreak: 'break-all'
            }}
          >
            {rawData?.cik ? 
              `https://data.sec.gov/api/xbrl/companyfacts/CIK${rawData.cik.padStart(10, '0')}.json` :
              'https://data.sec.gov/api/xbrl/companyfacts/CIK{padded_cik}.json'
            }
          </Box>
          
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Raw Financial Data:</Typography>
          <pre style={{ 
            margin: 0,
            fontSize: '0.875rem',
            overflowX: 'auto',
            color: theme.palette.mode === 'dark' ? '#e6e6e6' : '#333'
          }}>
            {formatJson(rawData)}
          </pre>
        </Box>
      )}
    </Box>
  );
}; 